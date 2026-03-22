import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useElections } from "@/hooks/use-elections";
import { ArrowLeft } from "lucide-react";
import LoadingAnimation from "../../../components/loading-animation/loading";
import { CandidateForm } from "./components/candidate-form";
import { CandidateRoster } from "./components/candidate-roster";

export default function ManageCandidates() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const electionId = Number(id);

  // Fetch all elections to lookup the actual election title
  const { data: elections, isLoading: electionsLoading } = useElections();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentElection = elections?.find((e: any) => e.id === electionId);

  if (electionsLoading) {
    return (
      <div className="flex h-[450px] w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!currentElection) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/elections")}
          className="cursor-pointer gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Elections
        </Button>
        <div className="py-20 text-center text-muted-foreground">
          Election context could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manage Candidates
          </h2>
          <p className="mt-1 text-muted-foreground">
            Assigning runners for{" "}
            <span className="font-semibold text-foreground">
              {currentElection.name}
            </span>
            .
          </p>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/elections")}
            className="-ml-3 cursor-pointer gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Elections
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT SIDE: CREATION FORM */}
        <CandidateForm electionId={electionId} />

        {/* RIGHT SIDE: CANDIDATES LIST */}
        <CandidateRoster electionId={electionId} />
      </div>
    </div>
  );
}
