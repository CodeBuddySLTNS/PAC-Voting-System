import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export interface StudentElection {
  id: number;
  title: string;
  status: "active" | "ended";
  isActive: boolean;
  academicYearId: number;
  voted: boolean;
  academicYear?: { id: number; name: string };
}

export function useStudentElections() {
  return useQuery({
    queryKey: ["student-elections"],
    queryFn: async () => {
      const response = await coleAPI("/api/votes/elections", "GET")({});
      return response.data as StudentElection[];
    },
  });
}

export interface Candidate {
  id: number;
  name: string;
  partyList?: string;
  imageUrl?: string;
}

export interface BallotPosition {
  positionId: number;
  title: string;
  maxVotes: number;
  isGlobal: boolean;
  candidates: Candidate[];
}

export interface ElectionBallotData {
  election: { id: number; name: string; isActive: boolean };
  ballot: BallotPosition[];
}

export function useElectionBallot(electionId: number) {
  return useQuery({
    queryKey: ["election-ballot", electionId],
    queryFn: async () => {
      const response = await coleAPI(`/api/votes/elections/${electionId}/ballot`, "GET")({});
      return response.data as ElectionBallotData;
    },
    enabled: !!electionId,
  });
}

export function useSubmitVote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { electionId: number; votes: { candidateId: number; positionId: number }[] }) =>
      coleAPI(`/api/votes/elections/${data.electionId}/submit`, "POST")({ votes: data.votes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-elections"] });
      toast.success("Vote cast successfully!");
      navigate("/", { replace: true });
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to cast vote");
      } else {
        toast.error("Failed to cast vote");
      }
    },
  });
}
