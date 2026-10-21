import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get('meta')
  async getMetadata() {
    return this.problemsService.getProblemMetadata();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const userId = req.user?.id;
    return this.problemsService.findAll({ ...query, userId });
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.problemsService.findBySlug(slug, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/note')
  async saveNote(@Param('id') problemId: string, @Body('content') content: string, @Request() req: any) {
    return this.problemsService.saveNote(req.user.id, problemId, content);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProblem(@Body() body: any) {
    return this.problemsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProblem(@Param('id') id: string) {
    return this.problemsService.delete(id);
  }
}
