import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/ui/field";
import { useCreateAdmin } from "@/hooks/use-admins";
import { UserPlus, Upload, X } from "lucide-react";

export default function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateAdmin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    createMutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setImagePreview(null);
        form.reset();
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Admin Account</DialogTitle>
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
                    className="absolute top-0 right-0 z-100 rounded-full bg-destructive p-1 text-white shadow"
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
              <Input name="firstName" required minLength={2} />
            </div>
            <div>
              <FieldLabel>Last Name</FieldLabel>
              <Input name="lastName" required minLength={2} />
            </div>
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <Input name="email" type="email" required />
          </div>

          <div>
            <FieldLabel>Password</FieldLabel>
            <Input name="password" type="password" required minLength={6} />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Admin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
