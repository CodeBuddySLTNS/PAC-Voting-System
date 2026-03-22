import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  type Candidate,
  useElectionCandidates,
  useCreateCandidate,
  useDeleteCandidate,
} from "@/hooks/use-candidates";
import {
  usePositions,
  useCreatePosition,
  useSearchStudents,
} from "@/hooks/use-config";
import { useElections } from "@/hooks/use-elections";
import {
  Trash2,
  UserPlus,
  Search,
  CheckCircle2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingAnimation from "../loading-animation/loading";

const schema = z.object({
  positionId: z.number().min(1, "Position is required"),
  partyList: z.string().optional(),
  studentId: z.number().optional(),
  name: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface StudentSearchInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Custom hook for debouncing search inputs
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function ManageCandidates() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const electionId = Number(id);

  // Fetch all elections to lookup the actual election title
  const { data: elections, isLoading: electionsLoading } = useElections();
  const currentElection = elections?.find((e: any) => e.id === electionId);

  const createMutation = useCreateCandidate();
  const deleteMutation = useDeleteCandidate(electionId || 0);

  const { data: candidates, isLoading: candidatesLoading } =
    useElectionCandidates(electionId || 0);
  const { data: positions } = usePositions();
  const createPositionMutation = useCreatePosition();

  // Group candidates into sections based on their position maps
  const candidatesByPosition = useMemo(() => {
    if (!candidates) return [];

    // Map candidates to their positionId securely
    const map = new Map<number, Candidate[]>();
    candidates.forEach((c: Candidate) => {
      const posId = c.position?.positionId || 0;
      if (!map.has(posId)) map.set(posId, []);
      map.get(posId)!.push(c);
    });

    const groups: {
      positionId: number;
      title: string;
      candidates: Candidate[];
    }[] = [];

    // Ordered grouping mapped to true database setup
    if (positions) {
      positions.forEach((pos) => {
        if (map.has(pos.positionId)) {
          groups.push({
            positionId: pos.positionId,
            title: pos.title,
            candidates: map.get(pos.positionId)!,
          });
          map.delete(pos.positionId);
        }
      });
    }

    // Handle any orphaned candidates gracefully
    map.forEach((cands, posId) => {
      groups.push({
        positionId: posId,
        title: cands[0]?.position?.title || "Unknown",
        candidates: cands,
      });
    });

    return groups;
  }, [candidates, positions]);

  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: "",
    maxVotes: 1,
    isGlobal: true,
  });

  const [activeTab, setActiveTab] = useState<"student" | "custom">("student");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const { data: searchResults, isLoading: searchLoading } =
    useSearchStudents(debouncedQuery);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSearchInfo | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      positionId: 0,
      partyList: "",
      name: "",
      imageUrl: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!electionId) return;

    createMutation.mutate(
      {
        electionId,
        positionId: data.positionId,
        partyList: data.partyList,
        studentId:
          activeTab === "student" && selectedStudent
            ? selectedStudent.id
            : undefined,
        name: activeTab === "custom" ? data.name : undefined,
        imageUrl: activeTab === "custom" ? data.imageUrl : undefined,
      },
      {
        onSuccess: () => {
          form.reset({
            positionId: data.positionId,
            partyList: data.partyList,
          });
          setSearchQuery("");
          setSelectedStudent(null);
        },
      }
    );
  };

  const handleAddPosition = () => {
    if (!newPosition.title.trim() || newPosition.maxVotes < 1) return;
    createPositionMutation.mutate(newPosition, {
      onSuccess: (data: any) => {
        form.setValue("positionId", data.data.positionId);
        setIsAddingPosition(false);
        setNewPosition({ title: "", maxVotes: 1, isGlobal: true });
      },
    });
  };

  const getCandidateName = (candidate: Candidate) => {
    if (candidate.student) {
      return `${candidate.student.firstName} ${candidate.student.lastName}`;
    }
    return candidate.name || "Unknown Candidate";
  };

  if (electionsLoading) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!currentElection) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/elections")}
          className="cursor-pointer gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Elections
        </Button>
        <div className="py-20 text-center text-muted-foreground">
          Election context could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manage Candidates
          </h2>
          <p className="mt-1 text-muted-foreground">
            Assigning runners for{" "}
            <span className="font-semibold text-foreground">
              {currentElection.name}
            </span>
            .
          </p>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/elections")}
            className="-ml-3 cursor-pointer gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Elections
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT SIDE: CREATION FORM */}
        <Card className="h-max border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Add New Runner</CardTitle>
            <CardDescription>
              Setup a candidate and bind them to a strict position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Field>
                <FieldLabel>Position</FieldLabel>
                {isAddingPosition ? (
                  <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      New Position Definition
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Title
                      </Label>
                      <Input
                        placeholder="Title (e.g. President)"
                        value={newPosition.title}
                        onChange={(e) =>
                          setNewPosition({
                            ...newPosition,
                            title: e.target.value,
                          })
                        }
                        disabled={createPositionMutation.isPending}
                      />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Max Votes
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Max Votes"
                          value={newPosition.maxVotes}
                          onChange={(e) =>
                            setNewPosition({
                              ...newPosition,
                              maxVotes: Number(e.target.value),
                            })
                          }
                          disabled={createPositionMutation.isPending}
                        />
                      </div>
                      <div className="mb-1.5 flex items-center gap-2 pr-2">
                        <Switch
                          checked={newPosition.isGlobal}
                          onCheckedChange={(val) =>
                            setNewPosition({ ...newPosition, isGlobal: val })
                          }
                          disabled={createPositionMutation.isPending}
                        />
                        <span className="text-xs text-muted-foreground">
                          Global
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingPosition(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddPosition}
                        disabled={
                          createPositionMutation.isPending ||
                          !newPosition.title.trim() ||
                          newPosition.maxVotes < 1
                        }
                      >
                        Save Definition
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Controller
                        control={form.control}
                        name="positionId"
                        render={({ field }) => (
                          <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                            value={field.value ? String(field.value) : ""}
                            disabled={createMutation.isPending}
                          >
                            <SelectTrigger
                              data-invalid={!!form.formState.errors.positionId}
                              className="w-full"
                            >
                              <SelectValue placeholder="Select a position..." />
                            </SelectTrigger>
                            <SelectContent>
                              {positions?.map((pos) => (
                                <SelectItem
                                  key={pos.positionId}
                                  value={String(pos.positionId)}
                                >
                                  {pos.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsAddingPosition(true)}
                      title="Add new Position"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!isAddingPosition && (
                  <FieldError errors={[form.formState.errors.positionId]} />
                )}
              </Field>

              <Field>
                <FieldLabel>Party List (Optional)</FieldLabel>
                <Input
                  placeholder="Leave blank for Independent"
                  {...form.register("partyList")}
                  disabled={createMutation.isPending}
                />
              </Field>

              <Tabs
                value={activeTab}
                onValueChange={(v: string) =>
                  setActiveTab(v as "student" | "custom")
                }
                className="mt-6 w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student">Registered Student</TabsTrigger>
                  <TabsTrigger value="custom">Custom Name</TabsTrigger>
                </TabsList>

                <TabsContent value="student" className="space-y-4 pt-4">
                  {selectedStudent ? (
                    <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-4">
                      <div>
                        <p className="text-sm font-medium">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {selectedStudent.email}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(null)}
                        className="h-8 cursor-pointer text-xs"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search student by name or email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      {searchQuery.length >= 2 && (
                        <div className="absolute top-11 right-0 left-0 z-50 max-h-[180px] overflow-y-auto rounded-md border bg-background shadow-lg">
                          {searchLoading ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                              Searching...
                            </div>
                          ) : searchResults?.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                              No students found.
                            </div>
                          ) : (
                            <div className="py-1">
                              {searchResults?.map((st: StudentSearchInfo) => (
                                <button
                                  key={st.id}
                                  type="button"
                                  className="flex w-full cursor-pointer items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-muted focus:bg-muted"
                                  onClick={() => setSelectedStudent(st)}
                                >
                                  <span>
                                    {st.firstName} {st.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {st.email}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 pt-4">
                  <Field>
                    <FieldLabel>Candidate Full Name</FieldLabel>
                    <Input
                      placeholder="Ex. Juan Tamad"
                      {...form.register("name")}
                      disabled={createMutation.isPending}
                    />
                    <FieldError errors={[form.formState.errors.name]} />
                  </Field>
                  <Field>
                    <FieldLabel>Image URL (Optional)</FieldLabel>
                    <Input
                      placeholder="https://..."
                      {...form.register("imageUrl")}
                      disabled={createMutation.isPending}
                    />
                  </Field>
                </TabsContent>
              </Tabs>

              {(form.formState.errors.name || form.formState.errors.root) && (
                <p className="mt-1 text-sm font-medium text-destructive">
                  Select a student or provide a custom name.
                </p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    (activeTab === "student" && !selectedStudent) ||
                    (activeTab === "custom" && !form.watch("name"))
                  }
                  className="w-full cursor-pointer gap-2 py-6 text-base"
                >
                  <UserPlus className="h-5 w-5" />
                  {createMutation.isPending
                    ? "Assigning..."
                    : "Assign Candidate"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT SIDE: CANDIDATES LIST */}
        <Card className="flex h-max flex-col gap-0 border-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-lg">Active Roster</CardTitle>
            <CardDescription>
              Live preview of assigned candidates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] w-full overflow-y-auto">
              {candidatesLoading ? (
                <div className="animate-pulse py-12 text-center text-sm text-muted-foreground">
                  Loading roster...
                </div>
              ) : candidates?.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-muted/10 p-12 text-center text-muted-foreground">
                  <UserPlus className="mb-3 h-10 w-10 opacity-20" />
                  <p className="text-sm">No candidates assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-6 p-4">
                  {candidatesByPosition.map((group) => (
                    <div key={group.positionId} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                        <h4 className="text-sm font-semibold text-foreground/80">
                          {group.title}
                        </h4>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground">
                          {group.candidates.length}
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {group.candidates.map((candidate: Candidate) => (
                          <div
                            key={candidate.candidateId}
                            className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/10"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm leading-none font-medium">
                                  {getCandidateName(candidate)}
                                </p>
                                {candidate.studentId && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                )}
                              </div>
                              {candidate.partyList && (
                                <div className="mt-1.5 flex items-center">
                                  <span className="rounded-sm bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs outline-1 outline-border">
                                    {candidate.partyList}
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Remove Candidate"
                              onClick={() =>
                                deleteMutation.mutate(candidate.candidateId)
                              }
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
