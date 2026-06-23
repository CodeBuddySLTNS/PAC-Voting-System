import { useState, useRef } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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
  useCreateCandidate,
  useElectionCandidates,
} from "@/hooks/use-candidates";
import {
  usePositions,
  useCreatePosition,
  useSearchStudents,
  useDepartments,
  useYearLevels,
} from "@/hooks/use-config";
import { UserPlus, Search, Plus, ImagePlus, X, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";

const schema = z.object({
  positionId: z.number().min(1, "Position is required"),
  partyList: z.string().optional(),
  studentId: z.number().optional(),
  name: z.string().optional(),
  departmentId: z.number().optional(),
  yearLevelId: z.number().optional(),
});

type FormValues = z.infer<typeof schema>;

interface StudentSearchInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface CandidateFormProps {
  electionId: number;
}

export function CandidateForm({ electionId }: CandidateFormProps) {
  const createMutation = useCreateCandidate();
  const { data: positions } = usePositions();
  const { data: departments } = useDepartments();
  const { data: yearLevels } = useYearLevels();
  const { data: existingCandidates } = useElectionCandidates(electionId);

  // student ids already in the roster — exclude from search
  const assignedStudentIds = new Set(
    existingCandidates?.filter((c) => c.studentId).map((c) => c.studentId!) ??
      []
  );
  const createPositionMutation = useCreatePosition();

  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: "",
    maxVotes: 1,
    isGlobal: true,
  });
  const [showGlobalInfo, setShowGlobalInfo] = useState(false);

  const [activeTab, setActiveTab] = useState<"student" | "custom">("student");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const { data: searchResults, isLoading: searchLoading } =
    useSearchStudents(debouncedQuery);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSearchInfo | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      positionId: 0,
      partyList: "",
      name: "",
      departmentId: 0,
      yearLevelId: 0,
    },
  });

  const watchedName = useWatch({
    control: form.control,
    name: "name",
  });

  const watchedPositionId = useWatch({
    control: form.control,
    name: "positionId",
  });

  // show dept/year fields only when the selected position is "representative"
  const isRepresentative = positions?.some(
    (p) =>
      p.positionId === watchedPositionId &&
      p.title.toLowerCase().includes("representative")
  );

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
        departmentId:
          activeTab === "custom" && isRepresentative && data.departmentId
            ? data.departmentId
            : undefined,
        yearLevelId:
          activeTab === "custom" && isRepresentative && data.yearLevelId
            ? data.yearLevelId
            : undefined,
        image: activeTab === "custom" && imageFile ? imageFile : undefined,
      },
      {
        onSuccess: () => {
          form.reset({
            positionId: data.positionId,
            partyList: data.partyList,
          });
          setSearchQuery("");
          setSelectedStudent(null);
          setImageFile(null);
          setImagePreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddPosition = () => {
    if (!newPosition.title.trim() || newPosition.maxVotes < 1) return;
    createPositionMutation.mutate(newPosition, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: (data: any) => {
        form.setValue("positionId", data.data.positionId);
        setIsAddingPosition(false);
        setNewPosition({ title: "", maxVotes: 1, isGlobal: true });
      },
    });
  };

  return (
    <Card className="h-max border-0 shadow-sm ring-1 ring-black/5">
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
                  <Label className="text-xs text-muted-foreground">Title</Label>
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
                      Max Votes that can be casted for this position
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
                  <div className="relative mb-1.5 flex items-center gap-2 pr-2">
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
                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={() => setShowGlobalInfo((v) => !v)}
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors hover:text-foreground" />
                    </button>
                    {showGlobalInfo && (
                      <div className="absolute top-full right-0 z-10 mt-1.5 w-56 rounded-md border bg-popover p-2.5 text-[11px] leading-snug text-muted-foreground shadow-md">
                        Turn off if only voters within the same department and year level can vote for this position (e.g. Representative).
                      </div>
                    )}
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
                          {searchResults
                            ?.filter(
                              (st: StudentSearchInfo) =>
                                !assignedStudentIds.has(st.id)
                            )
                            .map((st: StudentSearchInfo) => (
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
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>
                    Department{!isRepresentative && " (Optional)"}
                  </FieldLabel>
                  <Controller
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ""}
                        disabled={createMutation.isPending}
                      >
                        <SelectTrigger
                          data-invalid={!!form.formState.errors.departmentId}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.acronym}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[form.formState.errors.departmentId]} />
                </Field>
                <Field>
                  <FieldLabel>
                    Year Level{!isRepresentative && " (Optional)"}
                  </FieldLabel>
                  <Controller
                    control={form.control}
                    name="yearLevelId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ""}
                        disabled={createMutation.isPending}
                      >
                        <SelectTrigger
                          data-invalid={!!form.formState.errors.yearLevelId}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {yearLevels?.map((yl) => (
                            <SelectItem key={yl.id} value={String(yl.id)}>
                              {yl.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[form.formState.errors.yearLevelId]} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Photo (Optional)</FieldLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  disabled={createMutation.isPending}
                  className="hidden"
                  id="candidate-image-upload"
                />
                {imagePreview ? (
                  <div className="relative w-fit">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-28 w-28 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-transform hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="candidate-image-upload"
                    className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Upload</span>
                  </label>
                )}
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
                (activeTab === "custom" &&
                  (!watchedName ||
                    (isRepresentative &&
                      (!form.watch("departmentId") ||
                        !form.watch("yearLevelId")))))
              }
              className="w-full cursor-pointer gap-2 py-6 text-base"
            >
              <UserPlus className="h-5 w-5" />
              {createMutation.isPending ? "Assigning..." : "Assign Candidate"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
