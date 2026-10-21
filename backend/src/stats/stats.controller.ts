import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyStats(@Request() req: any) {
    return this.statsService.getUserStats(req.user.id);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.statsService.getLeaderboard();
  }
}
