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
};

