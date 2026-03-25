import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coleAPI, baseURL } from "@/lib/utils";
import { axiosInstance } from "@/lib/auth-interceptor";
import { useMainStore } from "@/store";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const fn = coleAPI("/api/admins");
      const res = await fn({});
      return res.admins as Admin[];
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = useMainStore.getState().token;
      const res = await axiosInstance.post("/api/admins", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin created successfully");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to create admin"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const fn = coleAPI(`/api/admins/${id}`, "DELETE");
      return fn({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin deleted successfully");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to delete admin"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const token = useMainStore.getState().token;
      const res = await axiosInstance.patch(`/api/admins/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin updated successfully");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update admin"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}
