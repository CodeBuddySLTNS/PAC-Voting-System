import { useMainStore } from "../../store";
import ElectionCard from "./components/election-card";
import { Card, CardContent } from "../../components/ui/card";
import { Ticket, AlertCircle, Camera } from "lucide-react";
import { useStudentElections } from "@/hooks/use-voting";
import { toast } from "sonner";

export default function StudentDashboard() {
  const user = useMainStore((state) => state.user);
  const { data: elections, isLoading, error } = useStudentElections();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-zinc-500">
          Loading elections...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
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

  const activeElectionsCount = elections?.filter((e) => e.isActive).length || 0;
  const votedCount = elections?.filter((e) => e.voted).length || 0;
  const pendingCount =
    activeElectionsCount -
    (elections?.filter((e) => e.voted && e.isActive).length || 0);

  return (
    <div className="animate-in space-y-8 duration-500 fade-in slide-in-from-bottom-4">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName}!
        </h2>
        <p>
          Here you can find your active elections, cast your votes, and track
        </p>
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
                    {votedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Pending Elections</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {pendingCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Profile Picture UI */}
          <Card className="group relative overflow-hidden border-none shadow-sm dark:bg-zinc-900/40">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <button
                  className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                  onClick={() =>
                    toast.info("Profile picture upload coming soon!")
                  }
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-md mb-1 font-semibold">Profile Picture</h3>
              <p className="px-2 text-xs text-zinc-500 dark:text-zinc-400">
                Update your photo to personalize your account.
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
            {elections?.length === 0 && (
              <p className="text-sm text-zinc-500">No elections found.</p>
            )}
            {elections?.map((election) => (
              <ElectionCard
                key={election.id}
                id={election.id}
                title={election.title}
                academicYear={election.academicYear?.name || "Unknown"}
                status={election.status}
                voted={election.voted}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
