import { useState, useMemo } from "react";
import { useStudents, useToggleStudentStatus } from "@/hooks/use-students";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export function ManageStudents() {
  const { data: students, isLoading } = useStudents();
  const toggleStatusMutation = useToggleStudentStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((student) => {
      const query = searchQuery.toLowerCase();
      const fullName =
        `${student.lastName} ${student.firstName} ${student.middleName || ""}`.toLowerCase();
      const email = student.email.toLowerCase();
      const department = student.department?.acronym.toLowerCase() || "";

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        department.includes(query)
      );
    });
  }, [students, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  );
  const validPage = Math.min(currentPage, totalPages);

  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
          <p className="mt-1 text-muted-foreground">
            View and manage student accounts and their voting eligibility.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-0 p-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Year Level</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Active
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
                      Loading students...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-muted-foreground"
                    >
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {student.lastName}, {student.firstName}{" "}
                        {student.middleName ? `${student.middleName[0]}.` : ""}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {student.department?.acronym || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {student.yearLevel?.year || "Unknown"}
                      </td>
                      <td className="flex justify-center px-6 py-4">
                        <Switch
                          checked={student.isActive}
                          onCheckedChange={() => {
                            if (!toggleStatusMutation.isPending) {
                              toggleStatusMutation.mutate(student.id);
                            }
                          }}
                          disabled={toggleStatusMutation.isPending}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && filteredStudents.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/10 px-6 py-4">
              <div className="hidden text-sm text-muted-foreground sm:block">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    filteredStudents.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredStudents.length}
                </span>{" "}
                results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validPage === 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <div className="px-2 text-sm font-medium text-muted-foreground sm:hidden">
                  Page {validPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={validPage === totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
