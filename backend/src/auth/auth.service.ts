import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password?: string;
    name: string;
    college?: string;
    graduationYear?: number;
    targetCompany?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password || 'password123', 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name.trim(),
        college: data.college || 'IIT / NIT / State Tech Univ',
        graduationYear: data.graduationYear || 2026,
        targetCompany: data.targetCompany || 'Google / Amazon / TCS Digital',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        college: true,
        graduationYear: true,
        targetCompany: true,
        createdAt: true,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async login(email: string, password?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password || 'password123', user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  async demoLogin() {
    // Find or create demo student
    let user = await this.prisma.user.findUnique({
      where: { email: 'student@placement.edu' },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('placement2026', 10);
      user = await this.prisma.user.create({
        data: {
          email: 'student@placement.edu',
          password: hashedPassword,
          name: 'Final Year Candidate',
          college: 'College of Engineering & Technology',
          graduationYear: 2026,
          targetCompany: 'Amazon / Microsoft / TCS Prime',
          role: 'STUDENT',
        },
      });
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  async demoAdminLogin() {
    // Find or create demo admin / placement trainer
    let user = await this.prisma.user.findUnique({
      where: { email: 'trainer@campusbridge.edu' },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('trainer2026', 10);
      user = await this.prisma.user.create({
        data: {
          email: 'trainer@campusbridge.edu',
          password: hashedPassword,
          name: 'Prof. Ramesh (Training & Placement Cell)',
          college: 'Campus Bridge Placement Academy',
          graduationYear: 2026,
          targetCompany: 'Admin & Question Committee',
          role: 'ADMIN',
        },
      });
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        college: true,
        graduationYear: true,
        targetCompany: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
            notes: true,
            assessmentAttempts: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; college?: string; graduationYear?: number; targetCompany?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        college: true,
        graduationYear: true,
        targetCompany: true,
      },
    });
  }
}
