import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    difficulty?: string;
    category?: string;
    company?: string;
    search?: string;
    status?: string;
    userId?: string;
  }) {
    const where: any = {};

    if (query.difficulty && query.difficulty !== 'ALL') {
      where.difficulty = query.difficulty.toUpperCase();
    }

    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { companyTags: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    if (query.company && query.company !== 'ALL') {
      where.companyTags = { contains: query.company };
    }

    const problems = await this.prisma.problem.findMany({
      where,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        companyTags: true,
        acceptanceRate: true,
        order: true,
        createdAt: true,
      },
    });

    let solvedSet = new Set<string>();
    let attemptedSet = new Set<string>();

    if (query.userId) {
      const userSubmissions = await this.prisma.submission.findMany({
        where: { userId: query.userId },
        select: { problemId: true, status: true },
      });

      for (const sub of userSubmissions) {
        if (sub.status === 'ACCEPTED') {
          solvedSet.add(sub.problemId);
        } else {
          attemptedSet.add(sub.problemId);
        }
      }
    }

    let parsedProblems = problems.map((p) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(p.companyTags);
      } catch (e) {
        tags = p.companyTags ? p.companyTags.split(',') : [];
      }

      let status = 'TODO';
      if (solvedSet.has(p.id)) {
        status = 'SOLVED';
      } else if (attemptedSet.has(p.id)) {
        status = 'ATTEMPTED';
      }

      return {
        ...p,
        companyTags: tags,
        status,
      };
    });

    if (query.status && query.status !== 'ALL') {
      parsedProblems = parsedProblems.filter((p) => p.status === query.status.toUpperCase());
    }

    return parsedProblems;
  }

  async findBySlug(slug: string, userId?: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { isHidden: false },
          select: {
            id: true,
            input: true,
            expectedOutput: true,
            explanation: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with slug ${slug} not found`);
    }

    let examples = [];
    let constraints = [];
    let companyTags = [];
    let defaultTemplates = {};
    let hints = [];

    try {
      examples = JSON.parse(problem.examples);
    } catch (e) {}

    try {
      constraints = JSON.parse(problem.constraints);
    } catch (e) {}

    try {
      companyTags = JSON.parse(problem.companyTags);
    } catch (e) {}

    try {
      defaultTemplates = JSON.parse(problem.defaultTemplates);
    } catch (e) {}

    try {
      if (typeof problem.hints === 'string') {
        hints = JSON.parse(problem.hints);
        if (typeof hints === 'string') {
          hints = JSON.parse(hints);
        }
      } else if (Array.isArray(problem.hints)) {
        hints = problem.hints;
      }
    } catch (e) {
      hints = problem.hints ? [String(problem.hints)] : [];
    }

    if (!Array.isArray(examples)) examples = [];
    if (!Array.isArray(constraints)) constraints = [];
    if (!Array.isArray(companyTags)) companyTags = [];
    if (!Array.isArray(hints)) hints = hints ? [String(hints)] : [];

    let userNote = '';
    let isSolved = false;

    if (userId) {
      const note = await this.prisma.note.findUnique({
        where: { userId_problemId: { userId, problemId: problem.id } },
      });
      if (note) userNote = note.content;

      const accepted = await this.prisma.submission.findFirst({
        where: { userId, problemId: problem.id, status: 'ACCEPTED' },
      });
      if (accepted) isSolved = true;
    }

    return {
      ...problem,
      examples,
      constraints,
      companyTags,
      defaultTemplates,
      hints,
      userNote,
      isSolved,
    };
  }

  async getProblemMetadata() {
    const all = await this.prisma.problem.findMany({
      select: { category: true, companyTags: true, difficulty: true },
    });

    const categoryMap = new Map<string, number>();
    const companyMap = new Map<string, number>();
    const difficultyCounts = { EASY: 0, MEDIUM: 0, HARD: 0 };

    for (const item of all) {
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
      if (item.difficulty in difficultyCounts) {
        difficultyCounts[item.difficulty]++;
      }

      try {
        const companies: string[] = JSON.parse(item.companyTags);
        for (const c of companies) {
          const comp = c.trim();
          if (comp) {
            companyMap.set(comp, (companyMap.get(comp) || 0) + 1);
          }
        }
      } catch (e) {}
    }

    return {
      categories: Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })),
      companies: Array.from(companyMap.entries()).map(([name, count]) => ({ name, count })),
      difficultyCounts,
      totalProblems: all.length,
    };
  }

  async saveNote(userId: string, problemId: string, content: string) {
    return this.prisma.note.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: { content },
      create: { userId, problemId, content },
    });
  }

  async create(data: any) {
    const slug = (
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    ).trim();

    const existing = await this.prisma.problem.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Problem with slug "${slug}" already exists`);
    }

    // Starter template defaults if not supplied
    let defaultTemplates = data.defaultTemplates;
    if (!defaultTemplates || Object.keys(defaultTemplates).length === 0) {
      const fnName = data.functionName || 'solve';
      defaultTemplates = {
        python: `class Solution:\n    def ${fnName}(self) -> int:\n        # Write your placement code here\n        pass\n`,
        cpp: `class Solution {\npublic:\n    int ${fnName}() {\n        // Write your solution here\n        return 0;\n    }\n};\n`,
        java: `class Solution {\n    public int ${fnName}() {\n        // Write your solution here\n        return 0;\n    }\n}\n`,
        javascript: `/**\n * @return {number}\n */\nvar ${fnName} = function() {\n    // Write your solution here\n};\n`,
      };
    }

    return this.prisma.problem.create({
      data: {
        slug,
        title: data.title,
        difficulty: data.difficulty || 'MEDIUM',
        category: data.category || 'Algorithms',
        description: data.description || '',
        examples: typeof data.examples === 'string' ? data.examples : JSON.stringify(data.examples || []),
        constraints: typeof data.constraints === 'string' ? data.constraints : JSON.stringify(data.constraints || []),
        companyTags: typeof data.companyTags === 'string' ? data.companyTags : JSON.stringify(data.companyTags || []),
        defaultTemplates: typeof defaultTemplates === 'string' ? defaultTemplates : JSON.stringify(defaultTemplates),
        hints: typeof data.hints === 'string' ? data.hints : JSON.stringify(data.hints || []),
        solution: data.solution || '',
        testCases: {
          create: (data.testCases || []).map((tc: any) => ({
            input: String(tc.input || '').trim(),
            expectedOutput: String(tc.expectedOutput || '').trim(),
            isHidden: Boolean(tc.isHidden),
            explanation: tc.explanation || '',
          })),
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.problem.delete({
      where: { id },
    });
  }
}
