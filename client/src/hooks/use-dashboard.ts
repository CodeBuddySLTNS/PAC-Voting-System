import { useQuery } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";

export interface DashboardStats {
  totalStudents: number;
  activeElections: number;
  totalVotes: number;
  activeStudents: number;
  inactiveStudents: number;
  electionEngagement: {
    name: string;
    value: number;
  }[];
  recentActivity: {
    id: number;
    action: string;
    user: string;
    time: string;
    avatar: string;
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const fn = coleAPI("/api/dashboard/stats");
      const res = await fn({});
      return res as DashboardStats;
    },
  });
}
