import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { CalendarIcon, ChevronRight } from "lucide-react";

interface ElectionCardProps {
  title: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "ended";
  voted: boolean;
}

export default function ElectionCard({ title, startDate, endDate, status, voted }: ElectionCardProps) {
  const statusStyles = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    upcoming: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    ended: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };

  const statusLabels = {
    active: "Live Now",
    upcoming: "Upcoming",
    ended: "Concluded"
  };

  return (
    <Card className="group overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
            {statusLabels[status]}
          </div>
          {voted && (
            <div className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
              Voted
            </div>
          )}
        </div>
        <CardTitle className="text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
          <CalendarIcon className="w-4 h-4 opacity-70" />
          <div className="flex flex-col">
            <span>Starts: {startDate}</span>
            <span>Ends: {endDate}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 justify-end">
        {status === "active" ? (
          <Button 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            disabled={voted}
            variant={voted ? "secondary" : "default"}
          >
            {voted ? "View Results" : "Cast Vote"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : status === "upcoming" ? (
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            Not Started
          </Button>
        ) : (
          <Button variant="ghost" className="w-full sm:w-auto text-indigo-600 dark:text-indigo-400">
            View Results
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
