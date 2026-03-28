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

    // check email uniqueness if changing
    if (data.email && data.email !== student.email) {
      const existing = await prisma.student.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new Error("Email already in use");
      }
    }

    return prisma.student.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.middleName !== undefined && { middleName: data.middleName || null }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
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
