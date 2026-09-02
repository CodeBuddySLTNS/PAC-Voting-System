import { prisma } from "../lib/prisma";

export interface RawStudentRow {
  studentId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  department: string;
  yearLevel: string;
  email?: string | null;
}

export interface ImportSummary {
  totalProcessed: number;
  inserted: number;
  updated: number;
  unchanged: number;
  errors: Array<{ row: number; studentId?: string; reason: string }>;
}

// cleans and normalizes strings
const sanitizeString = (val?: string | null): string => {
  if (!val) return "";
  return val.toString().trim();
};

// sanitizes middle name to null if empty or placeholder
const sanitizeMiddleName = (val?: string | null): string | null => {
  if (!val) return null;
  const trimmed = val.toString().trim();
  if (
    !trimmed ||
    ["n/a", "na", "none", "-", "null", "undefined"].includes(
      trimmed.toLowerCase(),
    )
  ) {
    return null;
  }
  return trimmed;
};

// sanitizes email
const sanitizeEmail = (val?: string | null): string | null => {
  if (!val) return null;
  const trimmed = val.toString().trim().toLowerCase();
  if (
    !trimmed ||
    ["n/a", "na", "none", "-", "null"].includes(trimmed) ||
    !trimmed.includes("@")
  ) {
    return null;
  }
  return trimmed;
};

export const StudentImportService = {
  // imports or upserts student masterlist with bulk chunking
  importStudents: async (rows: RawStudentRow[]): Promise<ImportSummary> => {
    const summary: ImportSummary = {
      totalProcessed: rows.length,
      inserted: 0,
      updated: 0,
      unchanged: 0,
      errors: [],
    };

    if (!rows || rows.length === 0) {
      return summary;
    }

    // pre-fetch departments and year levels in memory
    const [departments, yearLevels] = await Promise.all([
      prisma.department.findMany(),
      prisma.yearLevel.findMany(),
    ]);

    const deptMap = new Map<string, number>();
    for (const d of departments) {
      deptMap.set(d.id.toString(), d.id);
      deptMap.set(d.acronym.toLowerCase().trim(), d.id);
      deptMap.set(d.name.toLowerCase().trim(), d.id);
    }

    const yearMap = new Map<string, number>();
    for (const y of yearLevels) {
      yearMap.set(y.id.toString(), y.id);
      yearMap.set(y.year.toLowerCase().trim(), y.id);
      // support common formats like '1st', '1st year', '1'
      const numMatch = y.year.match(/\d+/);
      if (numMatch) {
        yearMap.set(numMatch[0], y.id);
      }
    }

    // validate rows and build valid batch
    const validRecords: Array<{
      studentId: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      email: string | null;
      departmentId: number;
      yearLevelId: number;
      isActivated: boolean;
      isActive: boolean;
    }> = [];

    const seenInFile = new Set<string>();

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row) continue;
      const rowNum = index + 1;

      const studentId = sanitizeString(row.studentId);
      const firstName = sanitizeString(row.firstName);
      const middleName = sanitizeMiddleName(row.middleName);
      const lastName = sanitizeString(row.lastName);
      const email = sanitizeEmail(row.email);
      const deptKey = sanitizeString(row.department).toLowerCase();
      const yearKey = sanitizeString(row.yearLevel).toLowerCase();

      if (!studentId) {
        summary.errors.push({ row: rowNum, reason: "Missing student ID" });
        continue;
      }
      if (!firstName || !lastName) {
        summary.errors.push({
          row: rowNum,
          studentId,
          reason: "Missing first name or last name",
        });
        continue;
      }

      const departmentId = deptMap.get(deptKey);
      if (!departmentId) {
        summary.errors.push({
          row: rowNum,
          studentId,
          reason: `Department not found: "${row.department}"`,
        });
        continue;
      }

      const yearLevelId = yearMap.get(yearKey);
      if (!yearLevelId) {
        summary.errors.push({
          row: rowNum,
          studentId,
          reason: `Year level not found: "${row.yearLevel}"`,
        });
        continue;
      }

      if (seenInFile.has(studentId.toLowerCase())) {
        continue;
      }
      seenInFile.add(studentId.toLowerCase());

      validRecords.push({
        studentId,
        firstName,
        middleName,
        lastName,
        email,
        departmentId,
        yearLevelId,
        isActivated: false,
        isActive: true,
      });
    }

    if (validRecords.length === 0) {
      return summary;
    }

    // check existing student ids from database
    const incomingIds = validRecords.map((r) => r.studentId);
    const existingStudents = await prisma.student.findMany({
      where: { studentId: { in: incomingIds } },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        departmentId: true,
        yearLevelId: true,
        isActivated: true,
        isActive: true,
      },
    });

    const existingMap = new Map<string, (typeof existingStudents)[0]>();
    for (const s of existingStudents) {
      existingMap.set(s.studentId.toLowerCase(), s);
    }

    const recordsToInsert: typeof validRecords = [];
    const recordsToUpdate: Array<{
      id: number;
      data: {
        departmentId: number;
        yearLevelId: number;
        firstName: string;
        middleName: string | null;
        lastName: string;
        isActive: boolean;
      };
    }> = [];

    for (const r of validRecords) {
      const existing = existingMap.get(r.studentId.toLowerCase());
      if (!existing) {
        recordsToInsert.push(r);
      } else {
        // check if academic program, year level, or names changed
        const hasChanged =
          existing.departmentId !== r.departmentId ||
          existing.yearLevelId !== r.yearLevelId ||
          existing.firstName !== r.firstName ||
          existing.middleName !== r.middleName ||
          existing.lastName !== r.lastName;

        if (hasChanged) {
          recordsToUpdate.push({
            id: existing.id,
            data: {
              departmentId: r.departmentId,
              yearLevelId: r.yearLevelId,
              firstName: r.firstName,
              middleName: r.middleName,
              lastName: r.lastName,
              isActive: true, // reset active eligibility for new term
            },
          });
        } else {
          summary.unchanged++;
        }
      }
    }

    // execute chunked bulk insert for new students
    const INSERT_CHUNK_SIZE = 500;
    for (let i = 0; i < recordsToInsert.length; i += INSERT_CHUNK_SIZE) {
      const chunk = recordsToInsert.slice(i, i + INSERT_CHUNK_SIZE);
      const result = await prisma.student.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      summary.inserted += result.count;
    }

    // execute chunked transactional update for existing promoted/shifted students
    const UPDATE_CHUNK_SIZE = 100;
    for (let i = 0; i < recordsToUpdate.length; i += UPDATE_CHUNK_SIZE) {
      const chunk = recordsToUpdate.slice(i, i + UPDATE_CHUNK_SIZE);
      await prisma.$transaction(
        chunk.map((item) =>
          prisma.student.update({
            where: { id: item.id },
            data: item.data,
          }),
        ),
      );
      summary.updated += chunk.length;
    }

    return summary;
  },
};
