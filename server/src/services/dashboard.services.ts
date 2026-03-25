import { prisma } from "../lib/prisma";

export const DashboardService = {
  getDashboardStats: async () => {
    const [totalStudents, activeElections, totalVotes, inactiveStudents] =
      await Promise.all([
        prisma.student.count(),
        prisma.election.count({ where: { isActive: true } }),
        prisma.vote.count(),
        prisma.student.count({ where: { isActive: false } }),
      ]);

    const activeStudents = totalStudents - inactiveStudents;

    // Recent activity: get latest 5 votes, distinct by student and election
    const recentVotes = await prisma.vote.findMany({
      take: 5,
      orderBy: { timestamp: "desc" },
      distinct: ["studentId", "electionId"],
      include: {
        student: true,
      },
    });

    const recentActivity = recentVotes.map((vote) => ({
      id: vote.voteId,
      action: "Vote casted",
      user: `${vote.student.firstName} ${vote.student.lastName}`,
      time: vote.timestamp,
      imageUrl: vote.student.imageUrl,
    }));

    const recentElections = await prisma.election.findMany({
      take: 5,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        academicYear: { select: { name: true } },
      },
    });

    const electionEngagement = await Promise.all(
      recentElections.reverse().map(async (e) => {
        const votes = await prisma.vote.findMany({
          where: { electionId: e.id },
          distinct: ["studentId"],
          select: { studentId: true },
        });
        return {
          name: `${e.name} (${e.academicYear.name})`,
          value: votes.length,
        };
      }),
    );

    return {
      totalStudents,
      activeElections,
      totalVotes,
      activeStudents,
      inactiveStudents,
      electionEngagement,
      recentActivity,
    };
  },
};
