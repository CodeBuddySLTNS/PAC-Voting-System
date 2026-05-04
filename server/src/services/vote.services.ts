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

        const now = new Date();
        const isPastEnd = new Date(election.endTime) < now;
        const isBeforeStart = new Date(election.startTime) > now;
        const isOnSchedule = !isPastEnd && !isBeforeStart;

        // derive ui status from active flag + schedule
        let status: "active" | "upcoming" | "scheduled" | "ended" = "ended";
        if (election.isActive && !isPastEnd) status = "active";
        else if (!election.isActive && isOnSchedule) status = "scheduled";
        else if (isBeforeStart) status = "upcoming";

        return {
          id: election.id,
          title: election.name,
          status,
          isActive: election.isActive,
          academicYearId: election.academicYearId,
          academicYear: election.academicYear,
          startTime: election.startTime,
          endTime: election.endTime,
          voted: voteCount > 0,
        };
      }),
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

    // block voting if schedule has concluded
    if (new Date(election.endTime) < new Date()) {
      throw new CustomError("Election voting period has ended", 403);
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

    // Fetch all positions
    const positions = await prisma.position.findMany();

    // fetch candidates for this election
    const candidates = await prisma.candidate.findMany({
      where: { electionId },
      include: {
        position: true,
        department: true,
        yearLevel: true,
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            departmentId: true,
            yearLevelId: true,
            department: true,
            yearLevel: true,
          },
        },
      },
    });

    const ballotPositions = [];
    const isRep = (title: string) =>
      title.toLowerCase().includes("representative");

    for (const position of positions) {
      // find candidates for this position
      let positionCandidates = candidates.filter(
        (c) => c.positionId === position.positionId,
      );

      if (!position.isGlobal) {
        // filter out candidates that do not belong to the voter's department
        positionCandidates = positionCandidates.filter((c) => {
          const deptId = c.departmentId ?? c.student?.departmentId;
          return deptId === student.departmentId;
        });
      }

      // for representative positions, only show candidates matching voter's dept + year
      if (isRep(position.title)) {
        positionCandidates = positionCandidates.filter((c) => {
          const deptId = c.departmentId ?? c.student?.departmentId;
          const ylId = c.yearLevelId ?? c.student?.yearLevelId;
          return (
            deptId === student.departmentId && ylId === student.yearLevelId
          );
        });
      }

      if (positionCandidates.length > 0) {
        ballotPositions.push({
          ...position,
          candidates: positionCandidates.map((c) => {
            const dept = c.department ?? c.student?.department;
            const yl = c.yearLevel ?? c.student?.yearLevel;
            return {
              id: c.candidateId,
              name:
                c.name ||
                (c.student
                  ? `${c.student.firstName} ${c.student.lastName}`
                  : "Unknown"),
              partyList: c.partyList,
              imageUrl: c.imageUrl,
              department: dept
                ? { id: dept.id, name: dept.name, acronym: dept.acronym }
                : null,
              yearLevel: yl ? { id: yl.id, year: yl.year } : null,
            };
          }),
        });
      }
    }

    return { election, ballot: ballotPositions };
  },

  submitVote: async (
    electionId: number,
    studentId: number,
    data: SubmitVoteInput,
  ) => {
    // Check if active
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });
    if (!election || !election.isActive) {
      throw new CustomError("Election is not active", 400);
    }

    // block voting if schedule has concluded
    if (new Date(election.endTime) < new Date()) {
      throw new CustomError("Election voting period has ended", 403);
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
        throw new CustomError(
          `Exceeded maximum votes for position ${pos.title}. Allowed: ${pos.maxVotes}, Given: ${voteCount}`,
          400,
        );
      }
    }

    // Verify candidate validity
    const voteData = data.votes.map((v) => ({
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
  },
};
