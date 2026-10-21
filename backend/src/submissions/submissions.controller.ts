import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('run')
  async runCode(@Body() body: any) {
    return this.submissionsService.runCode(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitCode(@Request() req: any, @Body() body: any) {
    return this.submissionsService.submitCode({
      userId: req.user.id,
      problemId: body.problemId,
      language: body.language,
      code: body.code,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('problem/:problemId')
  async getProblemSubmissions(@Request() req: any, @Param('problemId') problemId: string) {
    return this.submissionsService.getProblemSubmissions(req.user.id, problemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/history')
  async getUserSubmissions(@Request() req: any) {
    return this.submissionsService.getUserSubmissions(req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getSubmissionById(@Param('id') id: string) {
    return this.submissionsService.getSubmissionById(id);
  }
}
