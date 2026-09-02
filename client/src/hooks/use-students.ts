import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { axiosInstance } from "@/lib/auth-interceptor";
import { useMainStore } from "@/store";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export interface Student {
  id: number;
  studentId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  isActivated: boolean;
  isActive: boolean;
  imageUrl: string | null;
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

export interface RawStudentRow {
  studentId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  department: string;
  yearLevel: string;
  email?: string | null;
}

export interface ImportSummary {
  totalProcessed: number;
  inserted: number;
  updated: number;
  unchanged: number;
  errors: Array<{ row: number; studentId?: string; reason: string }>;
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

export function useImportStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (students: RawStudentRow[]) => {
      const fn = coleAPI("/api/users/students/import", "POST");
      return fn({ students }) as Promise<{
        message: string;
        summary: ImportSummary;
      }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] });
      toast.success(
        `Import complete: ${data.summary.inserted} added, ${data.summary.updated} updated (promoted/shifted), ${data.summary.unchanged} unchanged`,
      );
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to import student masterlist",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}

export function useMakeAllStudentsEligible() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { departmentId?: string; yearLevelId?: string }) => {
      let url = "/api/users/students/make-all-eligible";
      const q = new URLSearchParams();
      if (params?.departmentId && params.departmentId !== "all") {
        q.append("departmentId", params.departmentId);
      }
      if (params?.yearLevelId && params.yearLevelId !== "all") {
        q.append("yearLevelId", params.yearLevelId);
      }
      if (q.toString()) {
        url += `?${q.toString()}`;
      }
      const fn = coleAPI(url, "POST");
      return fn({}) as Promise<{ message: string; updatedCount: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-counts"] });
      toast.success(
        `All ${data.updatedCount ?? ""} students are now eligible to vote!`,
      );
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update voter eligibility",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
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

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const token = useMainStore.getState().token;
      const res = await axiosInstance.patch(`/api/users/students/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student updated successfully");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update student"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const setUser = useMainStore((state) => state.setUser);
  const user = useMainStore((state) => state.user);

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = useMainStore.getState().token;
      const res = await axiosInstance.patch("/api/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      
      // manually update zustand store user
      if (user && data.student) {
        setUser({
          ...user,
          ...data.student,
        });
      }
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}
