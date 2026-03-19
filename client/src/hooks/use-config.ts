import { useQuery } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";

interface Department {
  id: number;
  name: string;
  acronym: string;
}

interface YearLevel {
  id: number;
  year: string;
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await coleAPI("/api/config/departments", "GET")({});
      return response.data as Department[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour caching
  });
}

export function useYearLevels() {
  return useQuery({
    queryKey: ["year-levels"],
    queryFn: async () => {
      const response = await coleAPI("/api/config/year-levels", "GET")({});
      return response.data as YearLevel[];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export interface AcademicYear {
  academicYearId: number;
  name: string;
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const response = await coleAPI("/api/config/academic-years", "GET")({});
      return response.data as AcademicYear[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string }) => coleAPI("/api/config/academic-years", "POST")(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      toast.success("Academic Year added successfully!");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add academic year");
      } else {
        toast.error("Failed to add academic year");
      }
    },
  });
}
