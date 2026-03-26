import { useState } from "react";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useElectionBallot, useSubmitVote } from "@/hooks/use-voting";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingAnimation from "@/components/loading-animation/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handlePhotoUrl } from "@/lib/utils";

export default function ElectionBallotForm() {
  const { id } = useParams();
  const electionId = Number(id);

  const { data, isLoading, error } = useElectionBallot(electionId);
  const submitVoteMutation = useSubmitVote();

  // state: positionId -> array of selected candidateIds
  const [selections, setSelections] = useState<Record<number, number[]>>({});

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <LoadingAnimation />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight">
            Unable to Load Ballot
          </h3>
          <p className="text-sm text-muted-foreground">
            You may have already voted or the election is inactive.
          </p>
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { election, ballot } = data;

  const toggleSelection = (
    positionId: number,
    maxVotes: number,
    candidateId: number
  ) => {
    setSelections((prev) => {
      const current = prev[positionId] || [];
      if (current.includes(candidateId)) {
        return {
          ...prev,
          [positionId]: current.filter((id) => id !== candidateId),
        };
      }
      if (current.length >= maxVotes) {
        if (maxVotes === 1) {
          return { ...prev, [positionId]: [candidateId] };
        }
        return prev; // already at max selected
      }
      return { ...prev, [positionId]: [...current, candidateId] };
    });
  };

  const totalSelections = Object.values(selections).flat().length;

  const handleSubmit = () => {
    const votes = [];
    for (const [positionId, candidateIds] of Object.entries(selections)) {
      for (const candidateId of candidateIds) {
        votes.push({ positionId: Number(positionId), candidateId });
      }
    }

    if (votes.length === 0) return; // Disallow empty submission implicitly

    submitVoteMutation.mutate({ electionId, votes });
  };

  return (
    <div className="container mx-auto px-2 py-4 sm:p-0 sm:pt-2">
      <div className="mx-auto max-w-4xl animate-in space-y-8 fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link
              to="/"
              className="hidden items-center text-sm font-medium text-primary hover:text-primary/80 md:inline-flex"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              {election.name}
            </h1>
            <p className="text-muted-foreground">Official Election Ballot</p>
          </div>
          <div className="hidden sm:block">
            <Badge variant="secondary" className="px-3 py-1">
              {totalSelections} Candidates Selected
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {ballot.map((position) => {
            const selectedForPos = selections[position.positionId] || [];
            const remaining = position.maxVotes - selectedForPos.length;

            return (
              <Card
                key={position.positionId}
                className="gap-0 overflow-hidden bg-card p-0 text-card-foreground shadow-sm"
              >
                <div className="flex flex-col justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
                  <div>
                    <h2 className="text-lg font-semibold">{position.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Vote for up to {position.maxVotes} candidate
                      {position.maxVotes > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    className="w-fit"
                    variant={remaining === 0 ? "default" : "secondary"}
                  >
                    {remaining === 0 ? "Max Selected" : `${remaining} left`}
                  </Badge>
                </div>

                <CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 md:grid-cols-3">
                  {position.candidates.map((candidate) => {
                    const isSelected = selectedForPos.includes(candidate.id);
                    const isDisabled =
                      !isSelected && remaining === 0 && position.maxVotes > 1;

                    return (
                      <button
                        key={candidate.id}
                        disabled={isDisabled}
                        onClick={() =>
                          toggleSelection(
                            position.positionId,
                            position.maxVotes,
                            candidate.id
                          )
                        }
                        className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all sm:gap-3 sm:p-4 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : isDisabled
                              ? "cursor-not-allowed border-border bg-muted/30 opacity-50"
                              : "cursor-pointer border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-background shadow-sm">
                          <Avatar className="h-full w-full">
                            <AvatarImage
                              src={handlePhotoUrl(
                                candidate.imageUrl,
                                candidate.name
                              )}
                            />
                            <AvatarFallback>
                              {candidate.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                              <CheckCircle2 className="h-8 w-8 text-primary" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {candidate.name}
                          </h3>
                          {candidate.partyList && (
                            <p className="text-xs text-muted-foreground">
                              {candidate.partyList}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-2 z-10 mx-1 flex items-center justify-between gap-2 rounded-2xl border bg-background/90 p-3 shadow-lg backdrop-blur-md sm:bottom-4 sm:mx-0 sm:p-4">
          <div className="text-xs font-medium sm:text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              Total Selections:{" "}
            </span>
            <span className="text-muted-foreground sm:hidden">Selected: </span>
            <span className="text-primary">{totalSelections}</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link to="/">Cancel</Link>
            </Button>
            <Button
              size="sm"
              className="hidden shadow-md shadow-primary/20 sm:flex"
              onClick={handleSubmit}
              disabled={totalSelections === 0 || submitVoteMutation.isPending}
            >
              {submitVoteMutation.isPending ? "Submitting..." : "Submit Ballot"}
            </Button>

            {/* Mobile concise submit button */}
            <Button
              size="sm"
              className="flex shadow-md shadow-primary/20 sm:hidden"
              onClick={handleSubmit}
              disabled={totalSelections === 0 || submitVoteMutation.isPending}
            >
              {submitVoteMutation.isPending ? "Waiting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
