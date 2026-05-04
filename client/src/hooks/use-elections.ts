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
  startTime: string;
  endTime: string;
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
    mutationFn: (data: {
      name: string;
      academicYearId: number;
      isActive: boolean;
      startTime: string;
      endTime: string;
    }) => coleAPI("/api/elections", "POST")(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      toast.success("Election created successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to create election"
        );
      } else {
        toast.error("Failed to create election");
      }
    },
  });
}

export function useUpdateElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      name?: string;
      isActive?: boolean;
      academicYearId?: number;
      startTime?: string;
      endTime?: string;
    }) =>
      coleAPI(
        `/api/elections/${data.id}`,
        "PATCH"
      )({
        name: data.name,
        isActive: data.isActive,
        academicYearId: data.academicYearId,
        startTime: data.startTime,
        endTime: data.endTime,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elections"] });
      toast.success("Election updated successfully");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update election"
        );
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
        toast.error(
          error.response?.data?.message || "Failed to delete election"
        );
      } else {
        toast.error("Failed to delete election");
      }
    },
  });
}

export interface ElectionResults {
  election: {
    id: number;
    name: string;
    academicYear: string;
    isActive: boolean;
    startTime: string;
    endTime: string;
  };
  stats: {
    totalVotes: number;
    totalVoters: number;
  };
  results: {
    positionId: number;
    title: string;
    maxVotes: number;
    candidates: {
      id: number;
      name: string | null;
      partyList: string | null;
      imageUrl: string | null;
      voteCount: number;
      department?: { id: number; name: string; acronym: string } | null;
      yearLevel?: { id: number; year: string } | null;
    }[];
  }[];
}

export function useElectionResults(id: number) {
  return useQuery({
    queryKey: ["election-results", id],
    queryFn: async () => {
      const response = await coleAPI(`/api/elections/${id}/results`, "GET")({});
      return response.data as ElectionResults;
    },
    enabled: !!id,
  });
}
