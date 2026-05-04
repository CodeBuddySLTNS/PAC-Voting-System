import { type StudentElection } from "@/hooks/use-voting";
import ElectionCard from "../election-card";

interface PastElectionsProps {
  elections: StudentElection[];
}

export default function PastElections({ elections }: PastElectionsProps) {
  const pastElections = elections.filter(
    (e) => !(e.isActive && new Date() < new Date(e.endTime))
  );

  if (pastElections.length === 0) return null;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Recent & Upcoming Elections
        </h3>
      </div>

      <div className="grid gap-4 opacity-90 transition-all hover:opacity-100 sm:grid-cols-2 lg:grid-cols-2">
        {pastElections
          .sort((a, b) => b.id - a.id)
          .map((election) => (
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
    </div>
  );
}
