import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export interface Student {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  isActive: boolean;
  departmentId: number;
  yearLevelId: number;
  department?: {
    id: number;
    name: string;
    acronym: string;
  };
  yearLevel?: {
    id: number;
    year: string;
  };
}

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const fn = coleAPI("/api/users/students");
      const res = await fn({});
      return res.students as Student[];
    },
  });
}

export function useToggleStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const fn = coleAPI(`/api/users/students/${id}/toggle-status`, "PATCH");
      return fn({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student status updated successfully");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update student status"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}
