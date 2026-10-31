import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProblemsModule } from './problems/problems.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { SheetsModule } from './sheets/sheets.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { StatsModule } from './stats/stats.module';
import { JudgeModule } from './judge/judge.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    PrismaModule,
    JudgeModule,
    AuthModule,
    ProblemsModule,
    SubmissionsModule,
    SheetsModule,
    AssessmentsModule,
    StatsModule,
  ],
})
export class AppModule {}
