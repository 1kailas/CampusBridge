import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user?.id;
    return this.sheetsService.findAll(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.sheetsService.findBySlug(slug, userId);
  }
}
