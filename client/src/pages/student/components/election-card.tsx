import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ElectionCardProps {
  id: number;
  title: string;
  academicYear: string;
  status: "active" | "upcoming" | "ended";
  voted: boolean;
}

export default function ElectionCard({
  id,
  title,
  academicYear,
  status,
  voted,
}: ElectionCardProps) {
  const statusStyles = {
    active:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    upcoming:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    ended:
      "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };

  const statusLabels = {
    active: "Live Now",
    upcoming: "Upcoming",
    ended: "Concluded",
  };

  return (
    <Card className="group gap-0 overflow-hidden border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-indigo-700">
      <CardHeader className="pb-4">
        <div className="mb-2 flex items-start justify-between">
          <div
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
          >
            {statusLabels[status]}
          </div>
          {voted && (
            <div className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
              Voted
            </div>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-xl transition-colors">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <CalendarIcon className="h-4 w-4 opacity-70" />
          <div className="flex flex-col">
            <span>Academic Year: {academicYear}</span>
            <span>Status: {statusLabels[status]}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap justify-end gap-2 pt-0">
        {status === "upcoming" && (
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            Not Started
          </Button>
        )}

        {status === "active" && !voted && (
          <>
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link to={`/student/election/${id}/results`}>
                Partial Results
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to={`/student/election/${id}/vote`}>
                Cast Vote
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </>
        )}

        {status === "active" && voted && (
          <Button
            variant="secondary"
            className="w-full border border-zinc-200 group-hover:text-indigo-600 sm:w-auto dark:group-hover:text-indigo-400"
            asChild
          >
            <Link to={`/student/election/${id}/results`}>Partial Results</Link>
          </Button>
        )}

        {status === "ended" && (
          <Button variant="default" className="w-full sm:w-auto" asChild>
            <Link to={`/student/election/${id}/results`}>Official Results</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
