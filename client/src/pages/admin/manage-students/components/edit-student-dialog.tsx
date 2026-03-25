import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateStudent, type Student } from "@/hooks/use-students";
import { useDepartments, useYearLevels } from "@/hooks/use-config";
import { handlePhotoUrl } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface EditStudentDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditStudentDialog({
  student,
  open,
  onOpenChange,
}: EditStudentDialogProps) {
  const initialPreview = student.imageUrl
    ? handlePhotoUrl(student.imageUrl)
    : null;
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPreview
  );
  const [departmentId, setDepartmentId] = useState(
    String(student.departmentId)
  );
  const [yearLevelId, setYearLevelId] = useState(String(student.yearLevelId));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateStudent();
  const { data: departments } = useDepartments();
  const { data: yearLevels } = useYearLevels();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("departmentId", departmentId);
    formData.set("yearLevelId", yearLevelId);

    updateMutation.mutate(
      { id: student.id, formData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* profile image */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/50">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-0 right-0 rounded-full bg-destructive p-1 text-white shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6" />
                  <span className="mt-1 text-[10px]">Upload</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>First Name</FieldLabel>
              <Input
                name="firstName"
                defaultValue={student.firstName}
                required
                minLength={2}
              />
            </div>
            <div>
              <FieldLabel>Last Name</FieldLabel>
              <Input
                name="lastName"
                defaultValue={student.lastName}
                required
                minLength={2}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Middle Name</FieldLabel>
            <Input name="middleName" defaultValue={student.middleName || ""} />
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <Input
              name="email"
              type="email"
              defaultValue={student.email}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Department</FieldLabel>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.acronym}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Year Level</FieldLabel>
              <Select value={yearLevelId} onValueChange={setYearLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearLevels?.map((yl) => (
                    <SelectItem key={yl.id} value={String(yl.id)}>
                      {yl.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
