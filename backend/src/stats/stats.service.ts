import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    // Total problems counts
    const totalEasy = await this.prisma.problem.count({ where: { difficulty: 'EASY' } });
    const totalMedium = await this.prisma.problem.count({ where: { difficulty: 'MEDIUM' } });
    const totalHard = await this.prisma.problem.count({ where: { difficulty: 'HARD' } });
    const totalOverall = totalEasy + totalMedium + totalHard;

    // Get all accepted submissions for this user
    const acceptedSubs = await this.prisma.submission.findMany({
      where: { userId, status: 'ACCEPTED' },
      include: {
        problem: {
          select: {
            id: true,
            difficulty: true,
            category: true,
            companyTags: true,
          },
        },
      },
    });

    // Unique solved problems
    const solvedMap = new Map<string, { difficulty: string; category: string; companyTags: string }>();
    for (const sub of acceptedSubs) {
      if (!solvedMap.has(sub.problem.id)) {
        solvedMap.set(sub.problem.id, sub.problem);
      }
    }

    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;
    const categoryCounts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};

    for (const [_, prob] of solvedMap) {
      if (prob.difficulty === 'EASY') solvedEasy++;
      else if (prob.difficulty === 'MEDIUM') solvedMedium++;
      else if (prob.difficulty === 'HARD') solvedHard++;

      categoryCounts[prob.category] = (categoryCounts[prob.category] || 0) + 1;

      try {
        const companies: string[] = JSON.parse(prob.companyTags);
        for (const c of companies) {
          companyCounts[c] = (companyCounts[c] || 0) + 1;
        }
      } catch (e) {}
    }

    const solvedTotal = solvedMap.size;

    // Recent 30 days submission activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSubs = await this.prisma.submission.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, status: true },
    });

    const activityByDate: Record<string, number> = {};
    for (const sub of recentSubs) {
      const dateStr = sub.createdAt.toISOString().split('T')[0];
      activityByDate[dateStr] = (activityByDate[dateStr] || 0) + 1;
    }

    // Assessments completed
    const assessmentsCompleted = await this.prisma.assessmentAttempt.findMany({
      where: { userId, status: 'SUBMITTED' },
      include: { assessment: { select: { title: true, company: true } } },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      overview: {
        solvedTotal,
        totalOverall,
        percent: totalOverall > 0 ? Math.round((solvedTotal / totalOverall) * 100) : 0,
        solvedEasy,
        totalEasy,
        solvedMedium,
        totalMedium,
        solvedHard,
        totalHard,
      },
      categoryCounts,
      companyCounts,
      activityByDate,
      assessmentsCompleted,
    };
  }

  async getLeaderboard() {
    // Group accepted submissions by user
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        college: true,
        targetCompany: true,
        submissions: {
          where: { status: 'ACCEPTED' },
          select: { problemId: true },
        },
        assessmentAttempts: {
          where: { status: 'SUBMITTED' },
          select: { score: true },
        },
      },
    });

    const leaderboard = users.map((u) => {
      const uniqueSolved = new Set(u.submissions.map((s) => s.problemId)).size;
      const totalAssessmentScore = u.assessmentAttempts.reduce((sum, a) => sum + a.score, 0);

      return {
        id: u.id,
        name: u.name,
        college: u.college || 'Engineering College',
        targetCompany: u.targetCompany || 'Top Tech',
        problemsSolved: uniqueSolved,
        assessmentScore: totalAssessmentScore,
        score: uniqueSolved * 10 + totalAssessmentScore,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);
    return leaderboard.slice(0, 50);
  }
}
