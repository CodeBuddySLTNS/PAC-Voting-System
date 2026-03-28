import { useState } from "react";
import { useMainStore } from "../../store";
import ActiveElections from "./components/active-elections/active-elections";
import PastElections from "./components/past-elections/past-elections";
import { Card, CardContent } from "../../components/ui/card";
import { Ticket, AlertCircle, Camera, Pencil } from "lucide-react";
import { useStudentElections } from "@/hooks/use-voting";
import LoadingAnimation from "@/components/loading-animation/loading";
import { cn, handlePhotoUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfileDialog from "./components/edit-profile-dialog";

export default function StudentDashboard() {
  const user = useMainStore((state) => state.user);
  const { data: elections, isLoading, error } = useStudentElections();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const activeElectionsCount = elections?.filter((e) => e.isActive).length || 0;
  const votedCount = elections?.filter((e) => e.voted).length || 0;
  const pendingCount =
    activeElectionsCount -
    (elections?.filter((e) => e.voted && e.isActive).length || 0);

  return (
    <div className="animate-in space-y-8 pb-8 duration-500 fade-in slide-in-from-bottom-4">
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
          <Card className="border-none bg-card p-0 shadow-sm dark:bg-zinc-900/40">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10",
                    user?.isActive
                      ? "text-primary"
                      : "border bg-red-500/10 text-red-500"
                  )}
                >
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Your Status</h3>
                  <p
                    className={cn(
                      "text-sm",
                      user?.isActive ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {user?.isActive
                      ? "Eligible to vote"
                      : "Not Eligible to vote"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Total Votes Cast</span>
                  <span className="font-semibold text-foreground">
                    {votedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Pending Elections</span>
                  <span className="font-semibold text-primary">
                    {pendingCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details UI */}
          <Card className="group relative overflow-hidden border-none p-0 shadow-sm dark:bg-zinc-900/40">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="absolute right-4 top-4">
                <button
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  onClick={() => setIsEditDialogOpen(true)}
                  title="Edit Profile"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={handlePhotoUrl(
                      user?.imageUrl,
                      `${user?.firstName} ${user?.lastName}`
                    )}
                  />
                  <AvatarFallback className="text-xl">
                    {user?.firstName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>

                <button
                  className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                  onClick={() => setIsEditDialogOpen(true)}
                  title="Change Photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mb-1 text-lg font-semibold">
                {user?.firstName} {user?.lastName}
              </h3>
              
              <div className="mt-2 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <p>
                  <span className="font-medium text-foreground">Department: </span>
                  {user?.department?.name || "Not set"}
                  {user?.department?.acronym ? ` (${user?.department?.acronym})` : ""}
                </p>
                <p>
                  <span className="font-medium text-foreground">Year Level: </span>
                  {user?.yearLevel?.year || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elections Sections */}
        <div className="space-y-12 md:col-span-2">
          <ActiveElections elections={elections || []} />
          <PastElections elections={elections || []} />
        </div>
      </div>

      <EditProfileDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </div>
  );
}
