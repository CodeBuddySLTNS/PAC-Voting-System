import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { CustomError } from "../lib/utils";
import status from "http-status";
import type { CreateAdminInput } from "../models/admin.models";

export const AdminService = {
  getAllAdmins: async () => {
    return prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  createAdmin: async (data: CreateAdminInput, imageFilename?: string) => {
    const existing = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new CustomError("Email already registered", status.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.admin.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: "ELECTION_OFFICER",
        imageUrl: imageFilename || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
    });
  },

  updateAdmin: async (
    id: number,
    data: { firstName?: string; lastName?: string; email?: string },
    imageFilename?: string,
  ) => {
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      throw new CustomError("Admin not found", status.NOT_FOUND);
    }

    // check email uniqueness if changing
    if (data.email && data.email !== admin.email) {
      const existing = await prisma.admin.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw new CustomError("Email already in use", status.CONFLICT);
      }
    }

    return prisma.admin.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email }),
        ...(imageFilename && { imageUrl: imageFilename }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
    });
  },

  deleteAdmin: async (id: number) => {
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      throw new CustomError("Admin not found", status.NOT_FOUND);
    }

    return prisma.admin.delete({ where: { id } });
  },
};
