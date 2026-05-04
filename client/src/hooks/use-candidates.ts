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
    department?: { id: number; name: string; acronym: string } | null;
    yearLevel?: { id: number; year: string } | null;
  } | null;
  department?: { id: number; name: string; acronym: string } | null;
  yearLevel?: { id: number; year: string } | null;
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
    mutationFn: async (data: {
      electionId: number;
      positionId: number;
      studentId?: number;
      name?: string;
      partyList?: string;
      departmentId?: number;
      yearLevelId?: number;
      image?: File;
    }) => {
      const formData = new FormData();
      formData.append("electionId", String(data.electionId));
      formData.append("positionId", String(data.positionId));
      if (data.partyList) formData.append("partyList", data.partyList);
      if (data.studentId) formData.append("studentId", String(data.studentId));
      if (data.name) formData.append("name", data.name);
      if (data.departmentId) formData.append("departmentId", String(data.departmentId));
      if (data.yearLevelId) formData.append("yearLevelId", String(data.yearLevelId));
      if (data.image) formData.append("image", data.image);

      const token = (await import("@/store")).useMainStore.getState().token;
      const { axiosInstance } = await import("@/lib/auth-interceptor");
      const res = await axiosInstance.post("/api/candidates", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return res.data;
    },
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
