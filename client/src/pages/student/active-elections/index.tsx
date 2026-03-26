import { useStudentElections } from "@/hooks/use-voting";
import ActiveElections from "../components/active-elections/active-elections";
import LoadingAnimation from "@/components/loading-animation/loading";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ActiveElectionsPage() {
  const { data: elections, isLoading, error } = useStudentElections();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight">
            Failed to load elections
          </h3>
          <p className="text-sm text-zinc-500">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-8 pb-8 duration-500 fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Active Elections
          </h2>
          <Badge className="animate-pulse border-none bg-emerald-500 hover:bg-emerald-600">
            Live
          </Badge>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">
          Browse and participate in currently open elections.
        </p>
      </div>

      <ActiveElections elections={elections || []} hideHeader />
    </div>
  );
}
