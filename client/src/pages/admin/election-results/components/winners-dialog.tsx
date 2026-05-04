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
import type { ElectionResults } from "@/hooks/use-elections";
import headerImg from "@/assets/header.png";

export interface CandidateResult {
  id: number;
  name: string | null;
  partyList?: string | null;
  imageUrl?: string | null;
  voteCount: number;
}

export interface PositionResult {
  positionId: number | string;
  title: string;
  maxVotes: number;
  candidates: CandidateResult[];
}

interface WinnersDialogProps {
  results: PositionResult[];
  election: ElectionResults["election"];
}

export function WinnersDialog({ results, election }: WinnersDialogProps) {
  const handleExportPDF = async () => {
    const doc = new jsPDF();

    try {
      const response = await fetch(headerImg);
      const blob = await response.blob();

      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // header.png is 600x100 (6:1 ratio). Page width is 210, margins are 14, so width is 182.
      // 182 / 6 is approx 30.3
      // Passing base64 directly prevents jsPDF canvas re-encoding blurriness
      doc.addImage(base64data, "PNG", 14, 10, 182, 30.3, "header", "FAST");
    } catch (e) {
      console.error("Failed to load header image for PDF", e);
    }

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleText = `${election.name} - Official Winners`;
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, (210 - titleWidth) / 2, 52);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const dateStr = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, (210 - dateWidth) / 2, 58);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 63, 196, 63);

    let yPos = 70;

    if (results.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.text("No results available yet.", 14, yPos);
      doc.save(`${election.name.replace(/\s+/g, "_")}_Winners.pdf`);
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
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      // Position Header Background
      doc.setFillColor(240, 244, 248); // light blue/gray
      doc.rect(14, yPos, 182, 10, "F");

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(position.title, 18, yPos + 7);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate-500
      const seatText = `${position.maxVotes} Seat${position.maxVotes > 1 ? "s" : ""}`;
      doc.text(seatText, 190 - doc.getTextWidth(seatText), yPos + 7);

      yPos += 15;

      // Table Headers
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("RANK", 18, yPos);
      doc.text("CANDIDATE", 35, yPos);
      doc.text("PARTY", 120, yPos);
      doc.text("VOTES", 189.5, yPos, { align: "right" });

      yPos += 3;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(14, yPos, 196, yPos);
      yPos += 6;

      // Table Rows
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // slate-900

      winners.forEach((w, index) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
          doc.setFontSize(11);
          doc.setTextColor(15, 23, 42);
        }

        doc.setFont("helvetica", "bold");
        doc.text(`#${w.rank}`, 18, yPos);

        doc.setFont("helvetica", "bold");
        doc.text(w.name || "Unknown", 35, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139); // slate-500
        const party = w.partyList || "Independent";
        doc.text(party, 120, yPos);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.text(w.voteCount.toString(), 186, yPos, { align: "right" });

        // Reset colors for next iteration if they got changed
        doc.setTextColor(15, 23, 42);

        yPos += 4;

        // subtle row divider except for last item
        if (index < winners.length - 1) {
          doc.setDrawColor(241, 245, 249); // slate-100
          doc.line(14, yPos, 196, yPos);
        }

        yPos += 6;
      });
    });

    doc.save(`${election.name.replace(/\s+/g, "_")}_Winners.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="cursor-pointer gap-2 shadow-sm"
          disabled={new Date() < new Date(election.endTime)}
          title={
            new Date() < new Date(election.endTime)
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
            <p className="text-sm text-muted-foreground">{election.name}</p>
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
                            <AvatarImage
                              src={handlePhotoUrl(winner.imageUrl, winner.name)}
                            />
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
