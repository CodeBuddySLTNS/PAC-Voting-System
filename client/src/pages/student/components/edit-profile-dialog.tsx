import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateMyProfile } from "@/hooks/use-students";
import { useMainStore } from "@/store";
import { handlePhotoUrl } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const user = useMainStore((state) => state.user);
  const initialPreview = user?.imageUrl ? handlePhotoUrl(user.imageUrl) : null;
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialPreview,
  );
  const [prevOpen, setPrevOpen] = useState(open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdateMyProfile();

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && user) {
      setImagePreview(user.imageUrl ? handlePhotoUrl(user.imageUrl) : null);
    }
  }

  useEffect(() => {
    if (open && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    updateMutation.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
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
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="absolute top-0 right-0 rounded-full bg-destructive p-1 text-white shadow cursor-pointer"
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

          <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Department:</span>{" "}
              {user?.department?.name || user?.department?.acronym || "N/A"}
            </p>
            <p>
              <span className="font-medium text-foreground">Year Level:</span>{" "}
              {user?.yearLevel?.year || "N/A"}
            </p>
            <p className="text-[11px] text-muted-foreground/70 pt-1 border-t mt-1">
              Note: Academic program and year level are managed by your Election Officer.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Photo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
