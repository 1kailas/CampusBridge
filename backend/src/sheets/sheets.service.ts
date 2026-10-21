import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SheetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const sheets = await this.prisma.sheet.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let solvedSet = new Set<string>();
    if (userId) {
      const acceptedSubmissions = await this.prisma.submission.findMany({
        where: { userId, status: 'ACCEPTED' },
        select: { problem: { select: { slug: true } } },
      });
      solvedSet = new Set(acceptedSubmissions.map((s) => s.problem.slug));
    }

    return sheets.map((sheet) => {
      let slugs: string[] = [];
      try {
        slugs = JSON.parse(sheet.problemSlugs);
      } catch (e) {}

      const totalProblems = slugs.length;
      const solvedProblems = slugs.filter((slug) => solvedSet.has(slug)).length;

      return {
        ...sheet,
        problemSlugs: slugs,
        totalProblems,
        solvedProblems,
        progressPercent: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
      };
    });
  }

  async findBySlug(slug: string, userId?: string) {
    const sheet = await this.prisma.sheet.findUnique({
      where: { slug },
    });

    if (!sheet) throw new NotFoundException('Sheet not found');

    let slugs: string[] = [];
    try {
      slugs = JSON.parse(sheet.problemSlugs);
    } catch (e) {}

    const problems = await this.prisma.problem.findMany({
      where: {
        slug: { in: slugs },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        companyTags: true,
        acceptanceRate: true,
      },
    });

    let solvedSet = new Set<string>();
    if (userId) {
      const acceptedSubmissions = await this.prisma.submission.findMany({
        where: { userId, status: 'ACCEPTED' },
        select: { problemId: true },
      });
      solvedSet = new Set(acceptedSubmissions.map((s) => s.problemId));
    }

    // Preserve sheet slug order
    const orderedProblems = slugs
      .map((s) => problems.find((p) => p.slug === s))
      .filter(Boolean)
      .map((p) => {
        let tags: string[] = [];
        try {
          tags = JSON.parse(p.companyTags);
        } catch (e) {}

        return {
          ...p,
          companyTags: tags,
          isSolved: solvedSet.has(p.id),
        };
      });

    const solvedCount = orderedProblems.filter((p) => p.isSolved).length;

    return {
      ...sheet,
      problems: orderedProblems,
      totalProblems: orderedProblems.length,
      solvedProblems: solvedCount,
      progressPercent: orderedProblems.length > 0 ? Math.round((solvedCount / orderedProblems.length) * 100) : 0,
    };
  }
}
