import { prisma } from "../lib/prisma";
import type {
  CreateElectionInput,
  UpdateElectionInput,
} from "../models/election.models";
import { CustomError } from "../lib/utils";

export const ElectionService = {
  getAllElections: async () => {
    return await prisma.election.findMany({
      include: {
        academicYear: true,
      },
      orderBy: { id: "desc" },
    });
  },

  createElection: async (data: CreateElectionInput) => {
    const existing = await prisma.election.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new CustomError("Election with this name already exists", 409);
    }

    if (data.isActive) {
      await prisma.election.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return await prisma.election.create({
      data: {
        name: data.name,
        academicYearId: data.academicYearId,
        isActive: data.isActive,
      },
      include: { academicYear: true },
    });
  },

  updateElection: async (id: number, data: UpdateElectionInput) => {
    const existing = await prisma.election.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new CustomError("Election not found", 404);
    }

    if (data.name && data.name !== existing.name) {
      const nameTaken = await prisma.election.findUnique({
        where: { name: data.name },
      });
      if (nameTaken) {
        throw new CustomError("Election with this name already exists", 409);
      }
    }

    if (data.isActive) {
      await prisma.election.updateMany({
        where: {
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    return await prisma.election.update({
      where: { id },
      data: updateData,
      include: { academicYear: true },
    });
  },

  deleteElection: async (id: number) => {
    const existing = await prisma.election.findUnique({
      where: { id },
      include: {
        _count: {
          select: { votes: true, candidates: true },
        },
      },
    });

    if (!existing) {
      throw new CustomError("Election not found", 404);
    }

    if (existing._count.votes > 0 || existing._count.candidates > 0) {
      throw new CustomError(
        "Cannot delete election with existing candidates or votes",
        409,
      );
    }

    await prisma.election.delete({
      where: { id },
    });

    return true;
  },
};
