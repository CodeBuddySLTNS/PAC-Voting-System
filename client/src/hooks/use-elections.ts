import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import type { AcademicYear } from "./use-config";

export interface Election {
  id: number;
  academicYearId: number;
  name: string;
  isActive: boolean;
  academicYear?: AcademicYear;
}

export function useElections() {
  return useQuery({
    queryKey: ["elections"],
    queryFn: async () => {
      const response = await coleAPI("/api/elections", "GET")({});
      return response.data as Election[];
    },
  });
}

export function useCreateElection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; academicYearId: number; isActive: boolean }) =>
      coleAPI("/api/elections", "POST")(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      toast.success("Election created successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create election");
      } else {
        toast.error("Failed to create election");
      }
    },
  });
}

export function useUpdateElection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number; name?: string; isActive?: boolean }) =>
      coleAPI(`/api/elections/${data.id}`, "PATCH")({
        name: data.name,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      toast.success("Election updated successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update election");
      } else {
        toast.error("Failed to update election");
      }
    },
  });
}

export function useDeleteElection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => coleAPI(`/api/elections/${id}`, "DELETE")({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      toast.success("Election deleted successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete election");
      } else {
        toast.error("Failed to delete election");
      }
    },
  });
}
