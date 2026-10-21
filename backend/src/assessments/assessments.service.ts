import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const assessments = await this.prisma.assessment.findMany({
      include: {
        problems: {
          select: { id: true, points: true },
        },
        attempts: userId
          ? {
              where: { userId },
              select: { id: true, score: true, status: true, startedAt: true, submittedAt: true },
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return assessments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      company: a.company,
      durationMinutes: a.durationMinutes,
      totalMarks: a.totalMarks,
      problemCount: a.problems.length,
      attempts: (a as any).attempts || [],
    }));
  }

  async findById(id: string, userId?: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        problems: {
          orderBy: { order: 'asc' },
          include: {
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                category: true,
                description: true,
                examples: true,
                constraints: true,
                defaultTemplates: true,
              },
            },
          },
        },
        attempts: userId
          ? {
              where: { userId },
              orderBy: { startedAt: 'desc' },
              take: 1,
            }
          : false,
      },
    });

    if (!assessment) throw new NotFoundException('Assessment not found');

    const formattedProblems = assessment.problems.map((ap) => {
      let examples = [];
      let constraints = [];
      let defaultTemplates = {};
      try {
        examples = JSON.parse(ap.problem.examples);
      } catch (e) {}
      try {
        constraints = JSON.parse(ap.problem.constraints);
      } catch (e) {}
      try {
        defaultTemplates = JSON.parse(ap.problem.defaultTemplates);
      } catch (e) {}

      return {
        ...ap.problem,
        points: ap.points,
        order: ap.order,
        examples,
        constraints,
        defaultTemplates,
      };
    });

    const latestAttempt = (assessment as any).attempts?.[0] || null;

    return {
      ...assessment,
      problems: formattedProblems,
      latestAttempt,
    };
  }

  async startAttempt(assessmentId: string, userId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    // Check if there's already an active attempt
    const existing = await this.prisma.assessmentAttempt.findFirst({
      where: {
        assessmentId,
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (existing) {
      // Check if time expired
      const elapsedMinutes = (Date.now() - new Date(existing.startedAt).getTime()) / (1000 * 60);
      if (elapsedMinutes > assessment.durationMinutes + 2) {
        await this.prisma.assessmentAttempt.update({
          where: { id: existing.id },
          data: { status: 'EXPIRED' },
        });
      } else {
        return existing;
      }
    }

    return this.prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  async submitAttempt(attemptId: string, userId: string, submissionData: { problemScores: { problemId: string; score: number; passedCount: number; totalCount: number }[] }) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: true },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new BadRequestException('Unauthorized attempt');

    const totalScore = (submissionData.problemScores || []).reduce((acc, curr) => acc + (curr.score || 0), 0);

    return this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        score: totalScore,
        submittedAt: new Date(),
        results: JSON.stringify(submissionData.problemScores),
      },
    });
  }
}
