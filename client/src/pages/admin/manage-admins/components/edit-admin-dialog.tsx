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
import { useUpdateAdmin, type Admin } from "@/hooks/use-admins";
import { handlePhotoUrl } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface EditAdminDialogProps {
  admin: Admin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditAdminDialog({
  admin,
  open,
  onOpenChange,
}: EditAdminDialogProps) {
  const initialPreview = admin.imageUrl ? handlePhotoUrl(admin.imageUrl) : null;
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPreview
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateAdmin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    updateMutation.mutate(
      { id: admin.id, formData },
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
          <DialogTitle>Edit Admin</DialogTitle>
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
                defaultValue={admin.firstName}
                required
                minLength={2}
              />
            </div>
            <div>
              <FieldLabel>Last Name</FieldLabel>
              <Input
                name="lastName"
                defaultValue={admin.lastName}
                required
                minLength={2}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <Input
              name="email"
              type="email"
              defaultValue={admin.email}
              required
            />
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
