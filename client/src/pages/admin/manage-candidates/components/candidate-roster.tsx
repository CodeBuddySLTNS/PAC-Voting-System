import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus, CheckCircle2 } from "lucide-react";
import {
  type Candidate,
  useElectionCandidates,
  useDeleteCandidate,
} from "@/hooks/use-candidates";
import { usePositions } from "@/hooks/use-config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handlePhotoUrl } from "@/lib/utils";

interface CandidateRosterProps {
  electionId: number;
}

export function CandidateRoster({ electionId }: CandidateRosterProps) {
  const deleteMutation = useDeleteCandidate(electionId || 0);
  const { data: candidates, isLoading: candidatesLoading } =
    useElectionCandidates(electionId || 0);
  const { data: positions } = usePositions();

  const candidatesByPosition = useMemo(() => {
    if (!candidates) return [];

    const map = new Map<number, Candidate[]>();
    candidates.forEach((c: Candidate) => {
      const posId = c.position?.positionId || 0;
      if (!map.has(posId)) map.set(posId, []);
      map.get(posId)!.push(c);
    });

    const groups: {
      positionId: number | string;
      title: string;
      candidates: Candidate[];
    }[] = [];

    if (positions) {
      positions.forEach((pos) => {
        if (!map.has(pos.positionId)) return;

        const cands = map.get(pos.positionId)!;
        map.delete(pos.positionId);

        // split representative positions into dept+year sub-groups
        if (pos.title.toLowerCase().includes("representative")) {
          const subGroups = new Map<string, Candidate[]>();
          cands.forEach((c) => {
            const dept = c.department ?? c.student?.department;
            const yl = c.yearLevel ?? c.student?.yearLevel;
            const key = `${dept?.id || 0}-${yl?.id || 0}`;
            if (!subGroups.has(key)) subGroups.set(key, []);
            subGroups.get(key)!.push(c);
          });

          Array.from(subGroups.entries())
            .sort(([, a], [, b]) => {
              const deptA = (a[0].department ?? a[0].student?.department)?.name ?? "";
              const deptB = (b[0].department ?? b[0].student?.department)?.name ?? "";
              if (deptA !== deptB) return deptA.localeCompare(deptB);
              const ylA = (a[0].yearLevel ?? a[0].student?.yearLevel)?.year ?? "";
              const ylB = (b[0].yearLevel ?? b[0].student?.yearLevel)?.year ?? "";
              return ylA.localeCompare(ylB);
            })
            .forEach(([key, subCands]) => {
              const dept = subCands[0].department ?? subCands[0].student?.department;
              const yl = subCands[0].yearLevel ?? subCands[0].student?.yearLevel;
              const deptLabel = dept?.acronym || "Unknown Dept";
              const ylLabel = yl?.year || "Unknown Year";

              groups.push({
                positionId: `${pos.positionId}-${key}`,
                title: `${pos.title} (${deptLabel} - ${ylLabel})`,
                candidates: subCands,
              });
            });
        } else {
          groups.push({
            positionId: pos.positionId,
            title: pos.title,
            candidates: cands,
          });
        }
      });
    }

    // leftover positions not found in the positions list
    map.forEach((cands, posId) => {
      groups.push({
        positionId: posId,
        title: cands[0]?.position?.title || "Unknown",
        candidates: cands,
      });
    });

    return groups;
  }, [candidates, positions]);

  const getCandidateName = (candidate: Candidate) => {
    if (candidate.student) {
      return `${candidate.student.firstName} ${candidate.student.lastName}`;
    }
    return candidate.name || "Unknown Candidate";
  };

  return (
    <Card className="flex h-max flex-col gap-0 border-0 shadow-sm ring-1 ring-black/5">
      <CardHeader className="border-b border-border/50 pb-3">
        <CardTitle className="text-lg">Active Roster</CardTitle>
        <CardDescription>Live preview of assigned candidates.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] w-full overflow-y-auto">
          {candidatesLoading ? (
            <div className="animate-pulse py-12 text-center text-sm text-muted-foreground">
              Loading roster...
            </div>
          ) : candidates?.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-muted/10 p-12 text-center text-muted-foreground">
              <UserPlus className="mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">No candidates assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-6 p-4">
              {candidatesByPosition.map((group) => (
                <div key={group.positionId} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <h4 className="text-sm font-semibold text-foreground/80">
                      {group.title}
                    </h4>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground">
                      {group.candidates.length}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {group.candidates.map((candidate: Candidate) => (
                      <div
                        key={candidate.candidateId}
                        className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/10"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage
                                src={handlePhotoUrl(
                                  candidate.imageUrl,
                                  getCandidateName(candidate)
                                )}
                              />
                              <AvatarFallback>
                                {getCandidateName(candidate).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm leading-none font-medium">
                              {getCandidateName(candidate)}
                            </p>
                            {candidate.studentId && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          {(() => {
                            const dept =
                              candidate.department ??
                              candidate.student?.department;
                            const yl =
                              candidate.yearLevel ??
                              candidate.student?.yearLevel;
                            return (
                              (candidate.partyList || dept || yl) && (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  {candidate.partyList && (
                                    <span className="rounded-sm bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs outline-1 outline-border">
                                      {candidate.partyList}
                                    </span>
                                  )}
                                  {dept && (
                                    <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                      {dept.acronym}
                                    </span>
                                  )}
                                  {yl && (
                                    <span className="rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                      {yl.year}
                                    </span>
                                  )}
                                </div>
                              )
                            );
                          })()}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Remove Candidate"
                          onClick={() =>
                            deleteMutation.mutate(candidate.candidateId)
                          }
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
