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

export interface Position {
  positionId: number;
  title: string;
  maxVotes: number;
  isGlobal: boolean;
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const response = await coleAPI("/api/config/positions", "GET")({});
      return response.data as Position[];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { title: string; maxVotes: number; isGlobal: boolean }) =>
      coleAPI("/api/config/positions", "POST")(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position created successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create position");
      } else {
        toast.error("Failed to create position");
      }
    },
  });
}

export function useSearchStudents(query: string) {
  return useQuery({
    queryKey: ["students-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await coleAPI(`/api/config/students/search?q=${encodeURIComponent(query)}`, "GET")({});
      return response.data;
    },
    enabled: query.length >= 2,
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
