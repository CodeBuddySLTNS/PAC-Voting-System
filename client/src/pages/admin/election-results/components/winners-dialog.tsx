import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handlePhotoUrl } from "@/lib/utils";

export interface CandidateResult {
  id: number;
  name: string | null;
  partyList?: string | null;
  imageUrl?: string | null;
  voteCount: number;
}

export interface PositionResult {
  positionId: number;
  title: string;
  maxVotes: number;
  candidates: CandidateResult[];
}

interface WinnersDialogProps {
  results: PositionResult[];
  electionName: string;
  isElectionActive: boolean;
}

export function WinnersDialog({
  results,
  electionName,
  isElectionActive,
}: WinnersDialogProps) {
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${electionName} - Official Winners`, 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr}`, 14, 28);

    let yPos = 40;

    if (results.length === 0) {
      doc.text("No results available yet.", 14, yPos);
      doc.save(`${electionName.replace(/\s+/g, "_")}_Winners.pdf`);
      return;
    }

    results.forEach((position) => {
      if (position.candidates.length === 0) return;

      const winners = [];
      let currentRank = 1;
      let previousVotes = -1;
      let slotsFilled = 0;

      for (const candidate of position.candidates) {
        if (candidate.voteCount === 0) continue;

        if (candidate.voteCount !== previousVotes) {
          if (slotsFilled >= position.maxVotes) break;
          currentRank = slotsFilled + 1;
          previousVotes = candidate.voteCount;
        }

        winners.push({ ...candidate, rank: currentRank });
        slotsFilled++;
      }

      if (winners.length === 0) return;

      // check page boundary
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(position.title, 14, yPos);
      yPos += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      winners.forEach((w) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const party = w.partyList || "Independent";
        doc.text(`• ${w.name} (${party}) - ${w.voteCount} votes`, 20, yPos);
        yPos += 7;
      });

      yPos += 6;
    });

    doc.save(`${electionName.replace(/\s+/g, "_")}_Winners.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="cursor-pointer gap-2 shadow-sm"
          disabled={isElectionActive}
          title={
            isElectionActive
              ? "Winners cannot be viewed while election is active"
              : "View official winners"
          }
        >
          <Trophy className="h-4 w-4" /> {"View Winners"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              Official Winners
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{electionName}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExportPDF}
            className="mr-6 cursor-pointer"
            title="Export as PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 space-y-8">
          {results.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No results available yet.
            </div>
          ) : (
            results.map((position) => {
              if (position.candidates.length === 0) return null;

              const winners = [];
              let currentRank = 1;
              let previousVotes = -1;
              let slotsFilled = 0;

              for (const candidate of position.candidates) {
                if (candidate.voteCount === 0) continue;

                if (candidate.voteCount !== previousVotes) {
                  if (slotsFilled >= position.maxVotes) break;
                  currentRank = slotsFilled + 1;
                  previousVotes = candidate.voteCount;
                }

                winners.push({ ...candidate, rank: currentRank });
                slotsFilled++;
              }

              return (
                <div key={position.positionId} className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <h3 className="text-lg font-bold">{position.title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {position.maxVotes} Seat{position.maxVotes > 1 ? "s" : ""}
                    </span>
                  </div>

                  {winners.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                      No winning candidates for this position (0 votes
                      recorded).
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {winners.map((winner) => (
                        <div
                          key={winner.id}
                          className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={handlePhotoUrl(winner.name)} />
                            <AvatarFallback>
                              {winner.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-base font-semibold">
                              {winner.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {winner.partyList || "Independent"}
                            </p>
                          </div>
                          <div className="pl-2 text-right">
                            <p className="text-lg font-bold text-primary">
                              {winner.voteCount.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                              Votes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
