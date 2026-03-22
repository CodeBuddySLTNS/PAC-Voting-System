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

  getElectionResults: async (id: number) => {
    const election = await prisma.election.findUnique({
      where: { id },
      include: { academicYear: true }
    });

    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    const candidates = await prisma.candidate.findMany({
      where: { electionId: id },
      include: {
        position: true,
        student: true,
        _count: { select: { votes: true } }
      }
    });

    const positionsMap = new Map<number, any>();
    candidates.forEach((c) => {
      if (!positionsMap.has(c.positionId)) {
        positionsMap.set(c.positionId, {
          positionId: c.positionId,
          title: c.position.title,
          maxVotes: c.position.maxVotes,
          candidates: []
        });
      }
      positionsMap.get(c.positionId).candidates.push({
        id: c.candidateId,
        name: c.student 
          ? `${c.student.firstName} ${c.student.lastName}`
          : c.name || "Unknown Candidate",
        partyList: c.partyList,
        imageUrl: c.imageUrl,
        voteCount: c._count.votes
      });
    });

    const results = Array.from(positionsMap.values()).map(pos => {
      pos.candidates.sort((a: any, b: any) => b.voteCount - a.voteCount);
      return pos;
    });

    const totalVotes = await prisma.vote.count({ where: { electionId: id } });
    
    const distinctVoters = await prisma.vote.findMany({
      where: { electionId: id },
      distinct: ['studentId'],
      select: { studentId: true }
    });

    return {
      election: {
        id: election.id,
        name: election.name,
        academicYear: election.academicYear.name,
        isActive: election.isActive,
      },
      stats: {
        totalVotes,
        totalVoters: distinctVoters.length
      },
      results
    };
  }
};
