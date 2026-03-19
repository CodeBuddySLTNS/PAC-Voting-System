import { useMainStore } from "../../store";
import ElectionCard from "./election-card";
import { Card, CardContent } from "../ui/card";
import { CheckCircle2, Ticket } from "lucide-react";

export default function StudentDashboard() {
  const user = useMainStore((state) => state.user);

  // Mock data for the UI
  const elections = [
    {
      id: 1,
      title: "Student Council Election 2026",
      startDate: "Oct 15, 2026 - 08:00 AM",
      endDate: "Oct 17, 2026 - 05:00 PM",
      status: "active" as const,
      voted: false,
    },
    {
      id: 2,
      title: "Department Representatives",
      startDate: "Nov 01, 2026 - 08:00 AM",
      endDate: "Nov 02, 2026 - 05:00 PM",
      status: "upcoming" as const,
      voted: false,
    },
    {
      id: 3,
      title: "Clubs & Society Presidents",
      startDate: "Sep 10, 2026 - 08:00 AM",
      endDate: "Sep 12, 2026 - 05:00 PM",
      status: "ended" as const,
      voted: true,
    },
  ];

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-lg shadow-indigo-600/20">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <p className="max-w-xl text-indigo-100">
            Here you can find your active elections, cast your votes, and track
            your voting history. Make your voice heard.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Voting Status Summary */}
        <div className="space-y-6 md:col-span-1">
          <Card className="border-none bg-white shadow-sm dark:bg-zinc-900/40">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Status</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Eligible to vote
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Total Votes Cast</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    4
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Pending Elections</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    1
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none bg-zinc-900 text-white shadow-sm dark:bg-zinc-900/40">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative z-10 flex flex-col items-center p-6 text-center">
              <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400" />
              <h3 className="mb-1 text-lg font-semibold">Identity Verified</h3>
              <p className="text-xs text-zinc-400">
                Your student ID is verified for the current academic year.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Elections List */}
        <div className="space-y-4 md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight">
              Your Elections
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {elections.map((election) => (
              <ElectionCard key={election.id} {...election} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
