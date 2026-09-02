import { useState, useMemo, useEffect } from "react";
import {
  useStudents,
  useToggleStudentStatus,
  useMakeAllStudentsEligible,
  type Student,
} from "@/hooks/use-students";
import { useDepartments, useYearLevels } from "@/hooks/use-config";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handlePhotoUrl } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Upload,
  FileSpreadsheet,
  CheckCheck,
  ChevronDown,
  Filter,
  Globe,
} from "lucide-react";
import EditStudentDialog from "./components/edit-student-dialog";
import ImportStudentsDialog from "./components/import-students-dialog";

const ITEMS_PER_PAGE = 10;

export default function ManageStudents() {
  const { data: students, isLoading } = useStudents();
  const toggleStatusMutation = useToggleStudentStatus();
  const makeAllEligibleMutation = useMakeAllStudentsEligible();
  const { data: departments } = useDepartments();
  const { data: yearLevels } = useYearLevels();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [confirmEligibleScope, setConfirmEligibleScope] = useState<
    "filter" | "all" | null
  >(null);

  const currentDept = departments?.find(
    (d) => d.id.toString() === selectedDepartment
  );
  const currentYear = yearLevels?.find(
    (y) => y.id.toString() === selectedYearLevel
  );

  const filterLabel = [
    currentDept ? currentDept.acronym : "All Depts",
    currentYear ? currentYear.year : "All Years",
  ]
    .filter(Boolean)
    .join(" - ");

  // Initialize defaults to the first available item instead of "all"
  useEffect(() => {
    if (departments && departments.length > 0 && selectedDepartment === "") {
      setSelectedDepartment(departments[0].id.toString());
    }
  }, [departments, selectedDepartment]);

  useEffect(() => {
    if (yearLevels && yearLevels.length > 0 && selectedYearLevel === "") {
      setSelectedYearLevel(yearLevels[0].id.toString());
    }
  }, [yearLevels, selectedYearLevel]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];

    return students.filter((student) => {
      const query = searchQuery.toLowerCase();
      const studentId = (student.studentId || "").toLowerCase();
      const fullName =
        `${student.lastName} ${student.firstName} ${student.middleName || ""}`.toLowerCase();
      const email = (student.email || "").toLowerCase();
      const department = student.department?.acronym.toLowerCase() || "";

      const matchesSearch =
        studentId.includes(query) ||
        fullName.includes(query) ||
        email.includes(query) ||
        department.includes(query);

      const matchesDepartment =
        selectedDepartment === "all" ||
        selectedDepartment === "" ||
        student.departmentId?.toString() === selectedDepartment ||
        student.department?.id.toString() === selectedDepartment;

      const matchesYearLevel =
        selectedYearLevel === "all" ||
        selectedYearLevel === "" ||
        student.yearLevelId?.toString() === selectedYearLevel ||
        student.yearLevel?.id.toString() === selectedYearLevel;

      return matchesSearch && matchesDepartment && matchesYearLevel;
    });
  }, [students, searchQuery, selectedDepartment, selectedYearLevel]);

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

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer gap-2 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50"
                disabled={
                  makeAllEligibleMutation.isPending ||
                  !students ||
                  students.length === 0
                }
              >
                <CheckCheck className="h-4 w-4 text-emerald-600" />
                <span>
                  {makeAllEligibleMutation.isPending
                    ? "Updating..."
                    : "Make Eligible"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Eligibility Scope</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setTimeout(() => setConfirmEligibleScope("filter"), 50);
                }}
                className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  <span>Current Filter Only</span>
                </div>
                <span className="pl-6 text-xs text-muted-foreground">
                  {filterLabel} ({filteredStudents.length} students)
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => {
                  setTimeout(() => setConfirmEligibleScope("all"), 50);
                }}
                className="flex cursor-pointer flex-col items-start gap-0.5 py-2"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <span>Across All Departments</span>
                </div>
                <span className="pl-6 text-xs text-muted-foreground">
                  Entire student population ({students?.length || 0} students)
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={confirmEligibleScope !== null}
            onOpenChange={(open) => {
              if (!open) {
                setConfirmEligibleScope(null);
                setTimeout(() => {
                  document.body.style.pointerEvents = "";
                }, 50);
              }
            }}
          >
            <AlertDialogContent
              className="min-w-md"
              onCloseAutoFocus={() => {
                document.body.style.pointerEvents = "";
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirmEligibleScope === "filter"
                    ? `Make Current Filter Eligible (${filterLabel})?`
                    : "Make All Students Eligible Across All Departments?"}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  {confirmEligibleScope === "filter"
                    ? `This will enable voting eligibility for ${filteredStudents.length} student(s) currently filtered (${filterLabel}).`
                    : `This will activate voting eligibility for all ${students?.length || 0} student(s) across all departments in the system.`}
                  <br className="mb-2" />
                  Once an individual student submits their ballot in an
                  election, their status will automatically be set back to
                  ineligible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setConfirmEligibleScope(null);
                    document.body.style.pointerEvents = "";
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (confirmEligibleScope === "filter") {
                      makeAllEligibleMutation.mutate(
                        {
                          departmentId: selectedDepartment,
                          yearLevelId: selectedYearLevel,
                        },
                        {
                          onSettled: () => {
                            document.body.style.pointerEvents = "";
                          },
                        },
                      );
                    } else {
                      makeAllEligibleMutation.mutate(
                        {},
                        {
                          onSettled: () => {
                            document.body.style.pointerEvents = "";
                          },
                        },
                      );
                    }
                    setConfirmEligibleScope(null);
                    document.body.style.pointerEvents = "";
                  }}
                  className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Yes, Make Eligible
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={() => setIsImportOpen(true)}
            className="cursor-pointer gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Import Excel Masterlist
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ID, name, email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Select
            value={selectedDepartment}
            onValueChange={(val) => {
              setSelectedDepartment(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="flex-1 sm:w-[160px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.acronym}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYearLevel}
            onValueChange={(val) => {
              setSelectedYearLevel(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Year Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearLevels?.map((yl) => (
                <SelectItem key={yl.id} value={yl.id.toString()}>
                  {yl.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-0 p-0 shadow-sm ring-1 ring-black/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Year Level</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Activation
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Eligible
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
                      colSpan={8}
                      className="animate-pulse px-6 py-10 text-center text-muted-foreground"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : paginatedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
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
                      <td className="px-6 py-4 font-mono text-xs font-medium">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage
                              src={handlePhotoUrl(
                                student.imageUrl,
                                `${student.firstName} ${student.lastName}`
                              )}
                              alt={student.firstName}
                            />
                            <AvatarFallback className="text-xs font-semibold uppercase">
                              {student.firstName[0]}
                              {student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {student.lastName}, {student.firstName}{" "}
                            {student.middleName
                              ? `${student.middleName[0]}.`
                              : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {student.email || (
                          <span className="text-muted-foreground/60 italic">
                            Unregistered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">
                          {student.department?.acronym || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {student.yearLevel?.year || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.isActivated ? (
                          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
                            Activated
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          >
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
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
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ImportStudentsDialog
            open={isImportOpen}
            onOpenChange={setIsImportOpen}
          />
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
      {editingStudent && (
        <EditStudentDialog
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open) => !open && setEditingStudent(null)}
        />
      )}
    </div>
  );
}
