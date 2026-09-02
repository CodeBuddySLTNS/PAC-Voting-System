import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useImportStudents,
  type RawStudentRow,
  type ImportSummary,
} from "@/hooks/use-students";
import { useDepartments, useYearLevels } from "@/hooks/use-config";
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDepartment?: string;
  initialYearLevel?: string;
}

// parses excel sheet rows into RawStudentRow items with optional scope presets
function parseExcelData(
  rows: Record<string, any>[],
  presetDepartment?: string,
  presetYearLevel?: string
): RawStudentRow[] {
  const result: RawStudentRow[] = [];

  for (const row of rows) {
    // find key matching variations
    const keys = Object.keys(row);
    const findValue = (possibleMatches: string[]) => {
      const match = keys.find((k) => {
        const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        return possibleMatches.some(
          (pm) => normalized === pm || normalized.includes(pm)
        );
      });
      return match ? row[match] : undefined;
    };

    const studentIdRaw = findValue([
      "studentid",
      "idnumber",
      "id",
      "studentno",
    ]);
    const firstNameRaw = findValue([
      "firstname",
      "first",
      "fname",
      "givenname",
    ]);
    const middleNameRaw = findValue(["middlename", "middle", "mname", "mi"]);
    const lastNameRaw = findValue(["lastname", "last", "lname", "surname"]);
    const deptRaw = findValue([
      "department",
      "course",
      "dept",
      "program",
      "college",
    ]);
    const yearRaw = findValue(["yearlevel", "year", "level", "yr"]);
    const emailRaw = findValue(["email", "emailaddress", "mail"]);

    const studentId = studentIdRaw ? String(studentIdRaw).trim() : "";
    const firstName = firstNameRaw ? String(firstNameRaw).trim() : "";
    const middleName = middleNameRaw ? String(middleNameRaw).trim() : null;
    const lastName = lastNameRaw ? String(lastNameRaw).trim() : "";
    const department =
      presetDepartment || (deptRaw ? String(deptRaw).trim() : "");
    const yearLevel =
      presetYearLevel || (yearRaw ? String(yearRaw).trim() : "");
    const email = emailRaw ? String(emailRaw).trim() : null;

    if (studentId && firstName && lastName) {
      result.push({
        studentId,
        firstName,
        middleName,
        lastName,
        department,
        yearLevel,
        email,
      });
    }
  }

  return result;
}

export default function ImportStudentsDialog({
  open,
  onOpenChange,
  initialDepartment,
  initialYearLevel,
}: ImportStudentsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: departments } = useDepartments();
  const { data: yearLevels } = useYearLevels();

  const [targetDeptId, setTargetDeptId] = useState<string>("auto");
  const [targetYearId, setTargetYearId] = useState<string>("auto");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RawStudentRow[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null
  );
  const [isParsing, setIsParsing] = useState(false);

  const importMutation = useImportStudents();

  // pre-fill scope from props when modal opens
  useEffect(() => {
    if (open) {
      if (initialDepartment && initialDepartment !== "all") {
        setTargetDeptId(initialDepartment);
      } else {
        setTargetDeptId("auto");
      }

      if (initialYearLevel && initialYearLevel !== "all") {
        setTargetYearId(initialYearLevel);
      } else {
        setTargetYearId("auto");
      }
    }
  }, [open, initialDepartment, initialYearLevel]);

  const selectedDeptObj = departments?.find(
    (d) => d.id.toString() === targetDeptId
  );
  const selectedYearObj = yearLevels?.find(
    (y) => y.id.toString() === targetYearId
  );

  const processFile = (
    file: File,
    deptOverride?: string,
    yearOverride?: string
  ) => {
    setIsParsing(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          toast.error("Excel workbook contains no sheets");
          setIsParsing(false);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          toast.error("Could not read Excel worksheet");
          setIsParsing(false);
          return;
        }

        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(
          worksheet,
          { defval: "" }
        );

        const rows = parseExcelData(jsonRows, deptOverride, yearOverride);
        setParsedRows(rows);

        if (rows.length === 0) {
          toast.warning(
            "No valid student records detected. Please ensure headers include Student ID, First Name, and Last Name."
          );
        } else {
          toast.success(`Successfully read ${rows.length} student records!`);
        }
      } catch (err) {
        toast.error("Failed to parse Excel file");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (
      !lowerName.endsWith(".xlsx") &&
      !lowerName.endsWith(".xls") &&
      !lowerName.endsWith(".csv")
    ) {
      toast.error("Please select a valid Excel file (.xlsx, .xls) or CSV");
      return;
    }

    setSelectedFile(file);
    processFile(file, selectedDeptObj?.acronym, selectedYearObj?.year);
  };

  // re-parse if user changes department or year level dropdown after choosing file
  const handleDepartmentChange = (val: string) => {
    setTargetDeptId(val);
    const newDeptObj = departments?.find((d) => d.id.toString() === val);
    if (selectedFile) {
      processFile(selectedFile, newDeptObj?.acronym, selectedYearObj?.year);
    }
  };

  const handleYearChange = (val: string) => {
    setTargetYearId(val);
    const newYearObj = yearLevels?.find((y) => y.id.toString() === val);
    if (selectedFile) {
      processFile(selectedFile, selectedDeptObj?.acronym, newYearObj?.year);
    }
  };

  const handleDownloadTemplate = () => {
    const isDeptPreset = targetDeptId !== "auto" && selectedDeptObj;
    const isYearPreset = targetYearId !== "auto" && selectedYearObj;

    // dynamic sample rows customized to the scope preset
    const sampleData = [
      {
        "Student ID": "2024-00101",
        "First Name": "Juan",
        "Middle Name": "Santos",
        "Last Name": "Dela Cruz",
        ...(!isDeptPreset && {
          Department: selectedDeptObj ? selectedDeptObj.acronym : "BSIT",
        }),
        ...(!isYearPreset && {
          "Year Level": selectedYearObj ? selectedYearObj.year : "1st Year",
        }),
        Email: "juan.delacruz@gmail.com",
      },
      {
        "Student ID": "2024-00102",
        "First Name": "Maria",
        "Middle Name": "",
        "Last Name": "Clara",
        ...(!isDeptPreset && {
          Department: selectedDeptObj ? selectedDeptObj.acronym : "BSCS",
        }),
        ...(!isYearPreset && {
          "Year Level": selectedYearObj ? selectedYearObj.year : "2nd Year",
        }),
        Email: "",
      },
      {
        "Student ID": "2024-00103",
        "First Name": "Crisostomo",
        "Middle Name": "",
        "Last Name": "Ibarra",
        ...(!isDeptPreset && {
          Department: selectedDeptObj ? selectedDeptObj.acronym : "BSSW",
        }),
        ...(!isYearPreset && {
          "Year Level": selectedYearObj ? selectedYearObj.year : "3rd Year",
        }),
        Email: "ibarra@gmail.com",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet["!cols"] = [
      { wch: 18 }, // Student ID
      { wch: 18 }, // First Name
      { wch: 16 }, // Middle Name
      { wch: 18 }, // Last Name
      ...(!isDeptPreset ? [{ wch: 16 }] : []), // Department
      ...(!isYearPreset ? [{ wch: 16 }] : []), // Year Level
      { wch: 30 }, // Email
    ];

    const fileName =
      isDeptPreset && isYearPreset
        ? `roster_${selectedDeptObj?.acronym}_${selectedYearObj?.year.replace(/\s+/g, "_")}.xlsx`
        : isDeptPreset
          ? `roster_${selectedDeptObj?.acronym}.xlsx`
          : "student_masterlist_template.xlsx";

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Roster");
    XLSX.writeFile(workbook, fileName);
    toast.success(`Template (${fileName}) downloaded!`);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) {
      toast.error("No valid student rows to import");
      return;
    }

    importMutation.mutate(
      {
        students: parsedRows,
        defaultDepartmentId:
          targetDeptId !== "auto" ? Number(targetDeptId) : undefined,
        defaultYearLevelId:
          targetYearId !== "auto" ? Number(targetYearId) : undefined,
      },
      {
        onSuccess: (res) => {
          setImportSummary(res.summary);
        },
      }
    );
  };

  const resetState = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) resetState();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import Excel Masterlist / Class Roster
          </DialogTitle>
          <DialogDescription>
            Import full campus masterlists or class rosters (.xlsx, .xls, .csv).
            Existing students will be promoted/shifted while preserving their
            emails and voting history.
          </DialogDescription>
        </DialogHeader>

        {importSummary ? (
          // summary report view
          <div className="space-y-4 py-3">
            <div className="rounded-xl border bg-muted/30 p-5 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="mt-3 text-lg font-semibold">
                Excel Import Completed
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Processed {importSummary.totalProcessed} total student rows
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-background p-3">
                  <span className="text-2xl font-bold text-emerald-600">
                    {importSummary.inserted}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    New Voters Added
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {importSummary.updated}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Updated (Promoted/Shifted)
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {importSummary.unchanged}
                  </span>
                  <p className="text-xs text-muted-foreground">Unchanged</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <span className="text-2xl font-bold text-destructive">
                    {importSummary.errors.length}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Errors / Issues
                  </p>
                </div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="mb-2 flex items-center gap-2 font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Issues found in file:
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto text-xs">
                  {importSummary.errors.map((err, idx) => (
                    <p key={idx} className="text-muted-foreground">
                      Row {err.row}: {err.reason}{" "}
                      {err.studentId ? `(${err.studentId})` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          // file upload & scope preset view
          <div className="space-y-4 py-2">
            {/* Scope Presets (Department & Year Level) */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Roster Scope Presets (Optional)
                </span>
                <span className="text-xs text-muted-foreground">
                  Avoids typing dept/year for hundreds of rows
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium">
                    <Layers className="h-3.5 w-3.5 text-emerald-600" />
                    Target Department
                  </label>
                  <Select
                    value={targetDeptId}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        From Excel File (Auto-detect)
                      </SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.acronym} - {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                    Target Year Level
                  </label>
                  <Select value={targetYearId} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        From Excel File (Auto-detect)
                      </SelectItem>
                      {yearLevels?.map((yl) => (
                        <SelectItem key={yl.id} value={yl.id.toString()}>
                          {yl.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Template download banner */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="text-sm">
                <p className="text-xs font-medium sm:text-sm">
                  {targetDeptId !== "auto" || targetYearId !== "auto"
                    ? `Get roster template for ${selectedDeptObj?.acronym || ""} ${selectedYearObj?.year || ""}`
                    : "Need the official Excel template?"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {targetDeptId !== "auto" && targetYearId !== "auto"
                    ? "Simplified template: Student ID, First Name, Middle Name, Last Name, Email"
                    : "Pre-configured with standard masterlist columns"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer gap-1.5"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-3.5 w-3.5" />
                Download Excel (.xlsx)
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
              >
                <FileSpreadsheet className="mb-2 h-10 w-10 text-emerald-600" />
                <p className="text-sm font-medium">
                  Click to browse or drop Excel file (.xlsx, .xls)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports full masterlists and section rosters (.xlsx, .xls,
                  .csv)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB •{" "}
                        {parsedRows.length} valid student rows detected
                        {targetDeptId !== "auto" && (
                          <span className="ml-1 font-medium text-emerald-600">
                            • [{selectedDeptObj?.acronym}]
                          </span>
                        )}
                        {targetYearId !== "auto" && (
                          <span className="ml-1 font-medium text-emerald-600">
                            • [{selectedYearObj?.year}]
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetState}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {parsedRows.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                      Previewing first {Math.min(5, parsedRows.length)} rows:
                    </p>
                    <div className="overflow-hidden rounded-lg border text-xs">
                      <table className="w-full">
                        <thead className="bg-muted font-medium text-muted-foreground">
                          <tr>
                            <th className="p-2 text-left">Student ID</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Department</th>
                            <th className="p-2 text-left">Year</th>
                            <th className="p-2 text-left">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {parsedRows.slice(0, 5).map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="p-2 font-mono font-medium">
                                {row.studentId}
                              </td>
                              <td className="p-2">
                                {row.lastName}, {row.firstName}{" "}
                                {row.middleName || ""}
                              </td>
                              <td className="p-2">
                                <span
                                  className={
                                    targetDeptId !== "auto"
                                      ? "font-semibold text-emerald-600"
                                      : ""
                                  }
                                >
                                  {row.department || (
                                    <span className="text-destructive italic">
                                      Missing
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="p-2">
                                <span
                                  className={
                                    targetYearId !== "auto"
                                      ? "font-semibold text-emerald-600"
                                      : ""
                                  }
                                >
                                  {row.yearLevel || (
                                    <span className="text-destructive italic">
                                      Missing
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="p-2 text-muted-foreground">
                                {row.email || (
                                  <span className="text-muted-foreground/60 italic">
                                    Not provided
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  !selectedFile ||
                  parsedRows.length === 0 ||
                  importMutation.isPending ||
                  isParsing
                }
                onClick={handleImport}
                className="cursor-pointer gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {importMutation.isPending ? "Importing..." : "Start Import"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
