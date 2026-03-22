import { useEffect, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateElection, type Election } from "@/hooks/use-elections";
import { useAcademicYears, useCreateAcademicYear } from "@/hooks/use-config";
import { Plus } from "lucide-react";
import { toLocalDatetime } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Election name is required"),
  academicYearId: z.number().min(1, "Academic Year is required"),
  isActive: z.boolean(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  election: Election | null;
  onOpenChange: (open: boolean) => void;
}

export function EditElectionDialog({ election, onOpenChange }: Props) {
  const updateMutation = useUpdateElection();
  const academicYearsQuery = useAcademicYears();
  const createYearMutation = useCreateAcademicYear();

  const [newYearName, setNewYearName] = useState("");
  const [isAddingYear, setIsAddingYear] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      academicYearId: 0,
      isActive: false,
      startTime: "",
      endTime: "",
    },
  });

  // Reset form with database values whenever election prop updates
  useEffect(() => {
    if (election) {
      form.reset({
        name: election.name,
        academicYearId: election.academicYearId,
        isActive: election.isActive,
        startTime: election.startTime ? toLocalDatetime(new Date(election.startTime)) : "",
        endTime: election.endTime ? toLocalDatetime(new Date(election.endTime)) : "",
      });
    }
  }, [election, form]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!election) return;
    updateMutation.mutate(
      { 
        id: election.id, 
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString()
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleAddYear = () => {
    if (!newYearName.trim()) return;
    createYearMutation.mutate(
      { name: newYearName },
      {
        onSuccess: (data: { data: { academicYearId: number } }) => {
          form.setValue("academicYearId", data.data.academicYearId);
          setNewYearName("");
          setIsAddingYear(false);
        },
      }
    );
  };

  if (!election) return null;

  const isOpen = !!election;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!updateMutation.isPending) onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Election</DialogTitle>
          <DialogDescription>
            Modify election configuration and timing bounds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="academicYearId">Academic Year</FieldLabel>
              {isAddingYear ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. 2025-2026"
                    value={newYearName}
                    onChange={(e) => setNewYearName(e.target.value)}
                    disabled={createYearMutation.isPending}
                  />
                  <Button
                    type="button"
                    onClick={handleAddYear}
                    disabled={createYearMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddingYear(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Controller
                    control={form.control}
                    name="academicYearId"
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : undefined}
                        disabled={
                          updateMutation.isPending ||
                          academicYearsQuery.isLoading
                        }
                      >
                        <SelectTrigger
                          id="academicYearId"
                          data-invalid={!!form.formState.errors.academicYearId}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select an academic year..." />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYearsQuery.data?.map((year) => (
                            <SelectItem
                              key={year.academicYearId}
                              value={String(year.academicYearId)}
                            >
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddingYear(true)}
                    title="Add new Academic Year"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!isAddingYear && (
                <FieldError errors={[form.formState.errors.academicYearId]} />
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Election Event Name</FieldLabel>
              <Input
                id="name"
                placeholder="Ex. SGO Election"
                {...form.register("name")}
                disabled={updateMutation.isPending}
                data-invalid={!!form.formState.errors.name}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
                <Input
                  id="startTime"
                  type="datetime-local"
                  {...form.register("startTime")}
                  disabled={updateMutation.isPending}
                  data-invalid={!!form.formState.errors.startTime}
                />
                <FieldError errors={[form.formState.errors.startTime]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="endTime">End Time</FieldLabel>
                <Input
                  id="endTime"
                  type="datetime-local"
                  {...form.register("endTime")}
                  disabled={updateMutation.isPending}
                  data-invalid={!!form.formState.errors.endTime}
                />
                <FieldError errors={[form.formState.errors.endTime]} />
              </Field>
            </div>

            <Field className="mt-2 grid w-full grid-cols-[1fr_auto] items-center rounded-lg border bg-muted/40 p-4">
              <div className="space-y-0.5">
                <FieldLabel className="text-base">Set Active Now</FieldLabel>
                <p className="mr-4 text-sm text-muted-foreground">
                  Activating this will automatically deactivate all other
                  ongoing elections safely.
                </p>
              </div>
              <div>
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={updateMutation.isPending}
                      aria-label="Set active now"
                    />
                  )}
                />
              </div>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || isAddingYear}
              className="cursor-pointer"
            >
              {updateMutation.isPending ? "Applying Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
