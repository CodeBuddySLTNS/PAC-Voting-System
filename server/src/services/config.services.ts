import { prisma } from "../lib/prisma";

export const ConfigService = {
  getDepartments: async () => {
    return await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        acronym: true,
      },
      orderBy: { name: "asc" },
    });
  },

  getYearLevels: async () => {
    return await prisma.yearLevel.findMany({
      select: {
        id: true,
        year: true,
      },
      orderBy: { id: "asc" },
    });
  },

  getAcademicYears: async () => {
    return prisma.academicYear.findMany({
      orderBy: { academicYearId: "desc" },
    });
  },

  createAcademicYear: async (name: string) => {
    return prisma.academicYear.create({
      data: { name },
    });
  },
};
