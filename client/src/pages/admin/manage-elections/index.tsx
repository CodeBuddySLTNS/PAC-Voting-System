import { useState, type ReactNode } from "react";
import {
  useElections,
  useDeleteElection,
  useUpdateElection,
  type Election,
} from "@/hooks/use-elections";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users, BarChart2, Edit } from "lucide-react";
import { CreateElectionDialog } from "./components/create-election-dialog";
import { EditElectionDialog } from "./components/edit-election-dialog";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Custom badge matching shadcn styles functionally
const Badge = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "secondary";
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none ${variant === "default" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
  >
    {children}
  </span>
);

export default function ManageElections() {
  const { data: elections, isLoading } = useElections();
  const deleteMutation = useDeleteElection();
  const updateMutation = useUpdateElection();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const toggleActive = (
    id: number,
    currentStatus: boolean,
    name: string,
    academicYearId: number
  ) => {
    updateMutation.mutate({
      id,
      isActive: !currentStatus,
      name,
      academicYearId,
    });
  };

  const openCandidates = (id: number) => {
    navigate(`/dashboard/elections/${id}/candidates`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Elections Setup</h2>
          <p className="mt-1 text-muted-foreground">
            Manage physical elections grouped by academic years.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="cursor-pointer gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Election
        </Button>
      </div>

      <Card className="overflow-hidden border-0 p-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Election Title</th>
                  <th className="px-6 py-4 font-semibold">Academic Year</th>
                  <th className="px-6 py-4 font-semibold">Schedule</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="animate-pulse px-6 py-10 text-center text-muted-foreground"
                    >
                      Loading elections database...
                    </td>
                  </tr>
                ) : elections?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-muted-foreground"
                    >
                      No elections created yet. Click above to initialize one.
                    </td>
                  </tr>
                ) : (
                  elections?.map((election: Election) => {
                    const now = new Date();
                    const startTime = new Date(election.startTime);
                    const endTime = new Date(election.endTime);
                    let statusLabel = "";
                    let isConcluded = false;

                    if (now > endTime) {
                      statusLabel = "Concluded";
                      isConcluded = true;
                    } else if (now < startTime) {
                      statusLabel = "Upcoming";
                    } else {
                      statusLabel = "Ongoing";
                    }

                    return (
                      <tr
                        key={election.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="px-6 py-4 font-medium">
                          {election.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {election.academicYear?.name || "Unbound"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex flex-col gap-1 text-center">
                            <span className="text-[12px]">
                              {formatDateTime(election.startTime)}
                            </span>
                            <span className="text-xs opacity-70">to</span>
                            <span className="text-[12px]">
                              {formatDateTime(election.endTime)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Badge
                              variant={
                                statusLabel === "Ongoing" && election.isActive
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {statusLabel}
                            </Badge>
                            {!election.isActive &&
                              statusLabel === "Ongoing" && (
                                <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                  Standby
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant={
                                election.isActive ? "outline" : "default"
                              }
                              size="sm"
                              className="cursor-pointer"
                              onClick={() =>
                                toggleActive(
                                  election.id,
                                  election.isActive,
                                  election.name,
                                  election.academicYearId
                                )
                              }
                              disabled={
                                updateMutation.isPending ||
                                (isConcluded && !election.isActive)
                              }
                            >
                              {election.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => setEditingElection(election)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer gap-2"
                              onClick={() => openCandidates(election.id)}
                            >
                              <Users className="h-4 w-4" />
                              Candidates
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                              onClick={() =>
                                navigate(
                                  `/dashboard/elections/${election.id}/results`
                                )
                              }
                            >
                              <BarChart2 className="h-4 w-4" />
                              Results
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => setDeleteId(election.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CreateElectionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditElectionDialog
        election={editingElection}
        onOpenChange={(isOpen) => !isOpen && setEditingElection(null)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              election instance and remove references to candidates. If there
              are existing votes or candidates, deletion will fail to protect
              historical data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteId) {
                  deleteMutation.mutate(deleteId, {
                    onSuccess: () => setDeleteId(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
