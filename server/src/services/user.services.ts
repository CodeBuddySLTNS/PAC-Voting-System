import { prisma } from "../lib/prisma";

export const UserService = {
  getAllStudents: async () => {
    return prisma.student.findMany({
      include: {
        department: true,
        yearLevel: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });
  },

  // bulk sets active status to true for students
  makeAllStudentsEligible: async (filter?: {
    departmentId?: number | undefined;
    yearLevelId?: number | undefined;
  }) => {
    const where: any = {};
    if (filter?.departmentId && !isNaN(filter.departmentId)) {
      where.departmentId = filter.departmentId;
    }
    if (filter?.yearLevelId && !isNaN(filter.yearLevelId)) {
      where.yearLevelId = filter.yearLevelId;
    }

    return prisma.student.updateMany({
      where,
      data: {
        isActive: true,
      },
    });
  },

  toggleStudentStatus: async (studentId: number) => {
    // get current status first
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return prisma.student.update({
      where: { id: studentId },
      data: {
        isActive: !student.isActive,
      },
      include: {
        department: true,
        yearLevel: true,
      },
    });
  },

  updateStudent: async (
    id: number,
    data: {
      studentId?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      email?: string;
      departmentId?: string | number;
      yearLevelId?: string | number;
    },
    imageFilename?: string,
  ) => {
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new Error("Student not found");
    }

    // check studentId uniqueness if changing
    if (data.studentId && data.studentId.trim() !== student.studentId) {
      const existingId = await prisma.student.findUnique({
        where: { studentId: data.studentId.trim() },
      });
      if (existingId) {
        throw new Error("Student ID already in use");
      }
    }

    // check email uniqueness if changing
    if (data.email && data.email.trim().toLowerCase() !== student.email) {
      const existingEmail = await prisma.student.findUnique({
        where: { email: data.email.trim().toLowerCase() },
      });
      if (existingEmail) {
        throw new Error("Email already in use");
      }
    }

    return prisma.student.update({
      where: { id },
      data: {
        ...(data.studentId && { studentId: data.studentId.trim() }),
        ...(data.firstName && { firstName: data.firstName.trim() }),
        ...(data.middleName !== undefined && {
          middleName: data.middleName ? data.middleName.trim() : null,
        }),
        ...(data.lastName && { lastName: data.lastName.trim() }),
        ...(data.email !== undefined && {
          email: data.email ? data.email.trim().toLowerCase() : null,
        }),
        ...(data.departmentId && { departmentId: Number(data.departmentId) }),
        ...(data.yearLevelId && { yearLevelId: Number(data.yearLevelId) }),
        ...(imageFilename && { imageUrl: imageFilename }),
      },
      include: {
        department: true,
        yearLevel: true,
      },
    });
  },

  updateMyProfile: async (
    studentId: number,
    data: { yearLevelId?: string | number },
    imageFilename?: string,
  ) => {
    return prisma.student.update({
      where: { id: studentId },
      data: {
        ...(data.yearLevelId && { yearLevelId: Number(data.yearLevelId) }),
        ...(imageFilename && { imageUrl: imageFilename }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        isActive: true,
        imageUrl: true,
        departmentId: true,
        yearLevelId: true,
        department: {
          select: { id: true, name: true, acronym: true },
        },
        yearLevel: {
          select: { id: true, year: true },
        },
      },
    });
  },
};
