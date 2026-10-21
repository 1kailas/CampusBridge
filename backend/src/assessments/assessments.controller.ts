import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user?.id;
    return this.assessmentsService.findAll(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.assessmentsService.findById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async startAttempt(@Param('id') id: string, @Request() req: any) {
    return this.assessmentsService.startAttempt(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit-attempt')
  async submitAttempt(@Param('id') attemptId: string, @Request() req: any, @Body() body: any) {
    return this.assessmentsService.submitAttempt(attemptId, req.user.id, body);
  }
}
