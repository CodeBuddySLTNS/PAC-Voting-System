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
