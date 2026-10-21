import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JudgeService } from '../judge/judge.service';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private judgeService: JudgeService,
  ) {}

  async runCode(dto: {
    problemId: string;
    language: string;
    code: string;
    customInput?: string;
  }) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: dto.problemId },
      include: {
        testCases: {
          where: { isHidden: false },
        },
      },
    });

    if (!problem) throw new NotFoundException('Problem not found');

    let testCasesToRun: { input: string; expectedOutput: string; isHidden?: boolean }[] = [];

    if (dto.customInput && dto.customInput.trim().length > 0) {
      // User provided custom test case input
      const trimmed = dto.customInput.trim();
      const match = problem.testCases.find(
        (tc) => tc.input.trim() === trimmed,
      );
      testCasesToRun = [
        {
          input: trimmed,
          expectedOutput: match ? match.expectedOutput.trim() : '',
          isHidden: false,
        },
      ];
    } else {
      // Use sample test cases
      testCasesToRun = problem.testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false,
      }));
    }

    const judgeResult = await this.judgeService.runJudge(
      dto.language,
      dto.code,
      testCasesToRun,
      4000,
      problem.slug,
    );
    return judgeResult;
  }

  async submitCode(dto: {
    userId: string;
    problemId: string;
    language: string;
    code: string;
  }) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: dto.problemId },
      include: {
        testCases: true,
      },
    });

    if (!problem) throw new NotFoundException('Problem not found');

    const testCasesToRun = problem.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
    }));

    const judgeResult = await this.judgeService.runJudge(
      dto.language,
      dto.code,
      testCasesToRun,
      4000,
      problem.slug,
    );

    const submission = await this.prisma.submission.create({
      data: {
        userId: dto.userId,
        problemId: dto.problemId,
        code: dto.code,
        language: dto.language,
        status: judgeResult.status,
        runtimeMs: judgeResult.runtimeMs,
        memoryKb: judgeResult.memoryKb,
        passedTests: judgeResult.passedTests,
        totalTests: judgeResult.totalTests,
        errorMessage: judgeResult.compileError || (judgeResult.failedTestCase ? judgeResult.failedTestCase.stderr : null),
        failedTestCase: judgeResult.failedTestCase ? JSON.stringify(judgeResult.failedTestCase) : null,
      },
    });

    // Update problem acceptance rate
    const totalSubmissions = await this.prisma.submission.count({
      where: { problemId: dto.problemId },
    });
    const acceptedSubmissions = await this.prisma.submission.count({
      where: { problemId: dto.problemId, status: 'ACCEPTED' },
    });

    if (totalSubmissions > 0) {
      const newRate = Math.round((acceptedSubmissions / totalSubmissions) * 1000) / 10;
      await this.prisma.problem.update({
        where: { id: dto.problemId },
        data: { acceptanceRate: newRate },
      });
    }

    return {
      submissionId: submission.id,
      ...judgeResult,
      createdAt: submission.createdAt,
    };
  }

  async getProblemSubmissions(userId: string, problemId: string) {
    return this.prisma.submission.findMany({
      where: {
        userId,
        problemId,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getUserSubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        problem: {
          select: {
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });
  }

  async getSubmissionById(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        problem: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!submission) throw new NotFoundException('Submission not found');
    return submission;
  }
}
