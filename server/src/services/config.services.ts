import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "../lib/prisma";
import { CustomError } from "../lib/utils";

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
    try {
      return await prisma.academicYear.create({
        data: { name },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CustomError("Academic year already exists", 409);
      }
      throw error;
    }
  },

  getPositions: async () => {
    return prisma.position.findMany({
      orderBy: { positionId: "asc" },
    });
  },

  createPosition: async (data: {
    title: string;
    maxVotes: number;
    isGlobal: boolean;
  }) => {
    return prisma.position.create({
      data,
    });
  },

  searchStudents: async (query: string) => {
    return prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: { select: { acronym: true } },
        yearLevel: { select: { year: true } },
      },
      take: 10,
    });
  },
};
