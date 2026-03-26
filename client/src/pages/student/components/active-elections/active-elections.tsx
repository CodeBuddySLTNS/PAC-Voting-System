import { type StudentElection } from "@/hooks/use-voting";
import ElectionCard from "../election-card";
import { Badge } from "@/components/ui/badge";

interface ActiveElectionsProps {
  elections: StudentElection[];
  hideHeader?: boolean;
}

export default function ActiveElections({
  elections,
  hideHeader = false,
}: ActiveElectionsProps) {
  const activeElections = elections.filter((e) => e.isActive);

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Active Elections
            </h3>
            <Badge className="animate-pulse border-none bg-emerald-500 hover:bg-emerald-600">
              Live
            </Badge>
          </div>
        </div>
      )}

      {activeElections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[3px]">
            <img src="/voting.gif" alt="Voting" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No Active Elections
          </h3>
          <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            There are no elections currently open for voting.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {activeElections.map((election) => (
            <ElectionCard
              key={election.id}
              id={election.id}
              title={election.title}
              academicYear={election.academicYear?.name || "Unknown"}
              status={election.status}
              voted={election.voted}
              startTime={election.startTime}
              endTime={election.endTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
