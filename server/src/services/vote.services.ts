import { prisma } from "../lib/prisma";
import type { SubmitVoteInput } from "../models/vote.models";
import { CustomError } from "../lib/utils";

export const VoteService = {
  getStudentElections: async (studentId: number) => {
    // Get all elections
    const elections = await prisma.election.findMany({
      include: { academicYear: true },
      orderBy: { id: "desc" },
    });

    // Determine if the student has voted in each
    const electionsWithVoteStatus = await Promise.all(
      elections.map(async (election) => {
        const voteCount = await prisma.vote.count({
          where: { studentId, electionId: election.id },
        });

        // Ensure we send properties with a shape consistent with the UI
        return {
          id: election.id,
          title: election.name,
          status: election.isActive ? "active" : "ended", // For UI mapping
          isActive: election.isActive,
          academicYearId: election.academicYearId,
          academicYear: election.academicYear,
          voted: voteCount > 0,
        };
      })
    );

    return electionsWithVoteStatus;
  },

  getBallot: async (electionId: number, studentId: number) => {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });
    if (!election || !election.isActive) {
      throw new CustomError("Election not found or not active", 404);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Check if student has already voted
    const hasVoted = await prisma.vote.findFirst({
      where: { studentId, electionId },
    });
    if (hasVoted) {
      throw new CustomError("You have already voted in this election", 403);
    }

    // Positions that apply to this student
    // global positions OR non-global but matches student department. Wait, we don't have department mapping on positions...
    // Let's check candidate mapping. A student can vote for any candidate in a global position.
    // For local positions, candidates should theoretically belong to the same department as the voting student?
    // Let's check how the schema maps Candidates to local departments in PAC Voting System.
    // The Candidate has `studentId` which relates to the student running, meaning Candidate -> Student -> departmentId
    // If it's a local position, we only show candidates from the SAME department as the voter.
    
    // Fetch all positions 
    const positions = await prisma.position.findMany();

    // Fetch candidates for this election
    const candidates = await prisma.candidate.findMany({
      where: { electionId },
      include: {
        position: true,
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, departmentId: true } },
      },
    });

    const ballotPositions = [];

    for (const position of positions) {
      // Find candidates for this position
      let positionCandidates = candidates.filter(c => c.positionId === position.positionId);
      
      if (!position.isGlobal) {
        // Filter out candidates that do not belong to the voter's department
        positionCandidates = positionCandidates.filter(c => c.student && c.student.departmentId === student.departmentId);
      }

      if (positionCandidates.length > 0) {
        ballotPositions.push({
          ...position,
          candidates: positionCandidates.map(c => ({
            id: c.candidateId,
            name: c.name || (c.student ? `${c.student.firstName} ${c.student.lastName}` : "Unknown"),
            partyList: c.partyList,
            imageUrl: c.imageUrl,
          })),
        });
      }
    }

    return { election, ballot: ballotPositions };
  },

  submitVote: async (electionId: number, studentId: number, data: SubmitVoteInput) => {
    // Check if active
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });
    if (!election || !election.isActive) {
      throw new CustomError("Election is not active", 400);
    }

    // Check if already voted
    const existingVote = await prisma.vote.findFirst({
      where: { studentId, electionId },
    });
    if (existingVote) {
      throw new CustomError("You have already voted in this election", 403);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    // Map votes by position to validate maxVotes constraint
    const votesByPosition = new Map<number, number>();
    for (const vote of data.votes) {
      const currentCount = votesByPosition.get(vote.positionId) || 0;
      votesByPosition.set(vote.positionId, currentCount + 1);
    }

    const positions = await prisma.position.findMany({
      where: { positionId: { in: Array.from(votesByPosition.keys()) } },
    });

    for (const pos of positions) {
      const voteCount = votesByPosition.get(pos.positionId) || 0;
      if (voteCount > pos.maxVotes) {
        throw new CustomError(`Exceeded maximum votes for position ${pos.title}. Allowed: ${pos.maxVotes}, Given: ${voteCount}`, 400);
      }
    }

    // Verify candidate validity
    const voteData = data.votes.map(v => ({
      studentId,
      candidateId: v.candidateId,
      positionId: v.positionId,
      electionId,
      voterDepartmentId: student.departmentId,
      voterYearLevelId: student.yearLevelId,
    }));

    await prisma.vote.createMany({
      data: voteData,
    });

    return { success: true };
  }
};
