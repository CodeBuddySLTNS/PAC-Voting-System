import { useState, useRef } from "react";
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
  useImportStudents,
  type RawStudentRow,
  type ImportSummary,
} from "@/hooks/use-students";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// parses excel sheet rows into RawStudentRow items
function parseExcelData(rows: Record<string, any>[]): RawStudentRow[] {
  const result: RawStudentRow[] = [];

  for (const row of rows) {
    // find key matching variations
    const keys = Object.keys(row);
    const findValue = (possibleMatches: string[]) => {
      const match = keys.find((k) => {
        const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        return possibleMatches.some((pm) => normalized === pm || normalized.includes(pm));
      });
      return match ? row[match] : undefined;
    };

    const studentIdRaw = findValue(["studentid", "idnumber", "id", "studentno"]);
    const firstNameRaw = findValue(["firstname", "first", "fname", "givenname"]);
    const middleNameRaw = findValue(["middlename", "middle", "mname", "mi"]);
    const lastNameRaw = findValue(["lastname", "last", "lname", "surname"]);
    const deptRaw = findValue(["department", "course", "dept", "program", "college"]);
    const yearRaw = findValue(["yearlevel", "year", "level", "yr"]);
    const emailRaw = findValue(["email", "emailaddress", "mail"]);

    const studentId = studentIdRaw ? String(studentIdRaw).trim() : "";
    const firstName = firstNameRaw ? String(firstNameRaw).trim() : "";
    const middleName = middleNameRaw ? String(middleNameRaw).trim() : null;
    const lastName = lastNameRaw ? String(lastNameRaw).trim() : "";
    const department = deptRaw ? String(deptRaw).trim() : "";
    const yearLevel = yearRaw ? String(yearRaw).trim() : "";
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
}: ImportStudentsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RawStudentRow[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const importMutation = useImportStudents();

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

        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: "",
        });

        const rows = parseExcelData(jsonRows);
        setParsedRows(rows);

        if (rows.length === 0) {
          toast.warning(
            "No valid student records detected. Please ensure headers include Student ID, First Name, Last Name, Department, and Year Level.",
          );
        } else {
          toast.success(`Successfully read ${rows.length} student records from Excel!`);
        }
      } catch (err) {
        toast.error("Failed to parse Excel file");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        "Student ID": "2023-00101",
        "First Name": "Juan",
        "Middle Name": "Santos",
        "Last Name": "Dela Cruz",
        "Department": "BSIT",
        "Year Level": "1st Year",
        "Email": "juan.delacruz@pac.edu.ph",
      },
      {
        "Student ID": "2023-00102",
        "First Name": "Maria",
        "Middle Name": "",
        "Last Name": "Clara",
        "Department": "BSCS",
        "Year Level": "2nd Year",
        "Email": "",
      },
      {
        "Student ID": "2023-00103",
        "First Name": "Crisostomo",
        "Middle Name": "",
        "Last Name": "Ibarra",
        "Department": "BSSW",
        "Year Level": "3rd Year",
        "Email": "ibarra@pac.edu.ph",
      },
      {
        "Student ID": "2023-00104",
        "First Name": "Leonor",
        "Middle Name": "Rivera",
        "Last Name": "Valenzuela",
        "Department": "BECED",
        "Year Level": "4th Year",
        "Email": "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet["!cols"] = [
      { wch: 18 }, // Student ID
      { wch: 18 }, // First Name
      { wch: 16 }, // Middle Name
      { wch: 18 }, // Last Name
      { wch: 16 }, // Department
      { wch: 16 }, // Year Level
      { wch: 30 }, // Email
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Masterlist");
    XLSX.writeFile(workbook, "student_masterlist_template.xlsx");
    toast.success("Excel template downloaded!");
  };

  const handleImport = () => {
    if (parsedRows.length === 0) {
      toast.error("No valid student rows to import");
      return;
    }

    importMutation.mutate(parsedRows, {
      onSuccess: (res) => {
        setImportSummary(res.summary);
      },
    });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import Excel Masterlist
          </DialogTitle>
          <DialogDescription>
            Import official voter records directly from an Excel spreadsheet (.xlsx, .xls).
            Accounts will be added as pre-approved voters ready for student activation.
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
              <p className="text-sm text-muted-foreground mt-1">
                Processed {importSummary.totalProcessed} total student rows
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border bg-background p-3">
                  <span className="text-2xl font-bold text-emerald-600">
                    {importSummary.inserted}
                  </span>
                  <p className="text-xs text-muted-foreground">New Voters Added</p>
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
                  <p className="text-xs text-muted-foreground">
                    Unchanged
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <span className="text-2xl font-bold text-destructive">
                    {importSummary.errors.length}
                  </span>
                  <p className="text-xs text-muted-foreground">Errors / Issues</p>
                </div>
              </div>
            </div>

            {importSummary.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 font-medium text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues found in Excel file:
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
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
          // file upload & preview view
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="text-sm">
                <p className="font-medium">Need the official Excel template?</p>
                <p className="text-xs text-muted-foreground">
                  Pre-configured with columns: Student ID, First Name, Middle Name, Last Name, Department, Year Level
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 cursor-pointer"
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
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
              >
                <FileSpreadsheet className="h-10 w-10 text-emerald-600 mb-2" />
                <p className="font-medium text-sm">
                  Click to browse or drop Excel file (.xlsx, .xls)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports Excel spreadsheets and CSV exports from school registrars
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
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Previewing first {Math.min(5, parsedRows.length)} rows:
                    </p>
                    <div className="rounded-lg border overflow-hidden text-xs">
                      <table className="w-full">
                        <thead className="bg-muted text-muted-foreground font-medium">
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
                              <td className="p-2">{row.department}</td>
                              <td className="p-2">{row.yearLevel}</td>
                              <td className="p-2 text-muted-foreground">
                                {row.email || (
                                  <span className="italic text-muted-foreground/60">
                                    Pending student activation
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
                className="gap-2 cursor-pointer"
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
