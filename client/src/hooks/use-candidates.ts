import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export interface Candidate {
  candidateId: number;
  name: string | null;
  studentId: number | null;
  positionId: number;
  electionId: number;
  partyList: string | null;
  imageUrl: string | null;
  position: {
    positionId: number;
    title: string;
    maxVotes: number;
    isGlobal: boolean;
  };
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function useElectionCandidates(electionId: number) {
  return useQuery({
    queryKey: ["candidates", electionId],
    queryFn: async () => {
      const response = await coleAPI(`/api/candidates/election/${electionId}`, "GET")({});
      return response.data as Candidate[];
    },
    enabled: !!electionId,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      electionId: number;
      positionId: number;
      studentId?: number;
      name?: string;
      partyList?: string;
      imageUrl?: string;
    }) => coleAPI("/api/candidates", "POST")(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates", variables.electionId] });
      toast.success("Candidate added successfully!");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add candidate");
      } else {
        toast.error("Failed to add candidate");
      }
    },
  });
}

export function useDeleteCandidate(electionId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => coleAPI(`/api/candidates/${id}`, "DELETE")({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates", electionId] });
      toast.success("Candidate removed from election");
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete candidate");
      } else {
        toast.error("Failed to delete candidate");
      }
    },
  });
}
