import { useParams, Link, useNavigate } from "react-router-dom";
import { useElectionResults } from "@/hooks/use-elections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Verified, CheckCircle2, ArrowLeft, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import LoadingAnimation from "@/components/loading-animation/loading";
import { WinnersDialog } from "./components/winners-dialog";
import { useMainStore } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handlePhotoUrl } from "@/lib/utils";

export default function ElectionResults() {
  const { id } = useParams();
  const electionId = Number(id);
  const navigate = useNavigate();
  const user = useMainStore((state) => state.user);

  const { data, isLoading, error } = useElectionResults(electionId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">
          Failed to load election results.
        </p>
        <Button asChild variant="outline">
          <Link to={user?.adminId ? "/dashboard/elections" : "/student"}>
            Go Back
          </Link>
        </Button>
      </div>
    );
  }

  const { election, stats, results: rawResults } = data;

  // students only see their own dept/year in representative positions
  const isStudent = !user?.adminId;
  const results = isStudent
    ? rawResults
        .map((pos) => {
          if (!pos.title.toLowerCase().includes("representative")) return pos;
          return {
            ...pos,
            candidates: pos.candidates.filter(
              (c) =>
                c.department?.id === user?.departmentId &&
                c.yearLevel?.id === user?.yearLevelId
            ),
          };
        })
        .filter((pos) => {
          if (
            pos.title.toLowerCase().includes("representative") &&
            pos.candidates.length === 0
          ) {
            return false;
          }
          return true;
        })
    : rawResults;

  return (
    <div className="animate-in space-y-6 pb-8 duration-500 fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {election.name} Results
          </h2>
          <p className="text-muted-foreground">
            Academic Year {election.academicYear}
          </p>
        </div>
        <div className="mb-2 hidden items-center gap-2 sm:flex">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(user?.adminId ? "/dashboard/elections" : "/student")
            }
            className="-ml-3 cursor-pointer gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" /> Back to{" "}
            {user?.adminId ? "Elections" : "Dashboard"}
          </Button>

          {user?.adminId && (
            <WinnersDialog results={results} election={election} />
          )}
        </div>
      </div>

      {election.isActive && new Date(election.endTime) > new Date() && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-500">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Live Election Ongoing</p>
            <p className="mt-1 leading-snug opacity-90">
              The results displayed are partial and subject to change until the
              election concludes. Official winners cannot be determined until
              voting closes.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-0 border-none shadow-sm shadow-zinc-200/50 dark:bg-zinc-900/40 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Turnout
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalVoters.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Number of voters participated
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 border-none shadow-sm shadow-zinc-200/50 dark:bg-zinc-900/40 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Votes Processed
            </CardTitle>
            <Verified className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalVotes.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Individual votes mapped across positions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-6">
        {results.length === 0 && (
          <div className="rounded-xl border border-dashed py-10 text-center">
            <p className="text-muted-foreground">
              No candidates or votes have been recorded for this election.
            </p>
          </div>
        )}

        {results.map((position) => {
          // Calculate max absolute vote to scale progress bars relative to the top candidate
          const totalVotesForPosition = position.candidates.reduce(
            (acc, c) => acc + c.voteCount,
            0
          );
          const topCandidateVotes =
            position.candidates.length > 0
              ? position.candidates[0].voteCount
              : 0;

          return (
            <Card
              key={position.positionId}
              className="gap-0 overflow-hidden p-0"
            >
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{position.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {totalVotesForPosition} total votes
                  </span>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {position.candidates.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No candidates registered.
                    </div>
                  )}
                  {position.candidates.map((candidate) => {
                    const progressValue =
                      topCandidateVotes === 0
                        ? 0
                        : (candidate.voteCount / topCandidateVotes) * 100;
                    const percentageOfTotal =
                      totalVotesForPosition === 0
                        ? 0
                        : Math.round(
                            (candidate.voteCount / totalVotesForPosition) * 100
                          );
                    const thresholdIndex = Math.min(
                      position.maxVotes - 1,
                      position.candidates.length - 1
                    );
                    const winningThreshold =
                      position.candidates[thresholdIndex]?.voteCount || 0;
                    const isWinner =
                      candidate.voteCount > 0 &&
                      candidate.voteCount >= winningThreshold;

                    return (
                      <div
                        key={candidate.id}
                        className="group relative flex items-center justify-between p-6 transition-colors hover:bg-muted/10"
                      >
                        <div className="flex w-1/3 min-w-[200px] items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={handlePhotoUrl(
                                candidate.imageUrl,
                                candidate.name
                              )}
                            />
                            <AvatarFallback>
                              {candidate.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="flex items-center gap-2 font-semibold text-foreground">
                              {candidate.name}
                              {isWinner && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {candidate.partyList || "Independent"}
                            </p>
                            {(candidate.department || candidate.yearLevel) && (
                              <div className="mt-1 flex items-center gap-1">
                                {candidate.department && (
                                  <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                    {candidate.department.acronym}
                                  </span>
                                )}
                                {candidate.yearLevel && (
                                  <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                    {candidate.yearLevel.year}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 px-4">
                          <Progress
                            value={progressValue}
                            className={`h-2.5 w-full ${isWinner ? "bg-emerald-500/10 [&>div]:bg-emerald-500" : "bg-primary/10"}`}
                          />
                        </div>

                        <div className="w-24 text-right">
                          <div className="text-lg font-bold">
                            {candidate.voteCount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentageOfTotal}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
