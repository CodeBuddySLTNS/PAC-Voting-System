import { prisma } from "../lib/prisma";
import type { CreateCandidateInput, UpdateCandidateInput } from "../models/candidate.models";
import { CustomError } from "../lib/utils";

export const CandidateService = {
  getCandidatesByElection: async (electionId: number) => {
    return await prisma.candidate.findMany({
      where: { electionId },
      include: {
        position: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            yearLevel: true,
          },
        },
      },
      orderBy: [
        { position: { positionId: "asc" } },
        { name: "asc" },
      ],
    });
  },

  createCandidate: async (data: CreateCandidateInput) => {
    // Prevent duplicate assigning of a student to the same election inherently
    if (data.studentId) {
      const existing = await prisma.candidate.findUnique({
        where: {
          studentId_electionId: {
            studentId: data.studentId,
            electionId: data.electionId,
          },
        },
      });

      if (existing) {
        throw new CustomError("This student is already a candidate in this election.", 409);
      }
    }

    return await prisma.candidate.create({
      data: {
        electionId: data.electionId,
        positionId: data.positionId,
        studentId: data.studentId ?? null,
        name: data.name ?? null,
        partyList: data.partyList ?? null,
        imageUrl: data.imageUrl ?? null,
      },
      include: {
        position: true,
        student: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  },

  updateCandidate: async (id: number, data: UpdateCandidateInput) => {
    const existing = await prisma.candidate.findUnique({ where: { candidateId: id } });
    if (!existing) {
      throw new CustomError("Candidate not found", 404);
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    return await prisma.candidate.update({
      where: { candidateId: id },
      data: updateData,
      include: {
        position: true,
      },
    });
  },

  deleteCandidate: async (id: number) => {
    const existing = await prisma.candidate.findUnique({
      where: { candidateId: id },
      include: { _count: { select: { votes: true } } },
    });

    if (!existing) {
      throw new CustomError("Candidate not found", 404);
    }

    if (existing._count.votes > 0) {
      throw new CustomError("Cannot delete a candidate with active registered votes.", 409);
    }

    await prisma.candidate.delete({
      where: { candidateId: id },
    });
    return true;
  },
};
