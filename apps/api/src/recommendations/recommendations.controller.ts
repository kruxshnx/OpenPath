import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { INGESTION_QUEUE } from '../queue/queue.module';
import { toRepoListItem } from '../repositories/serializers';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(INGESTION_QUEUE) private readonly queue: Queue,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthUser) {
    const recs = await this.prisma.recommendation.findMany({
      where: { userId: user.userId },
      orderBy: { compositeScore: 'desc' },
      include: { repository: { include: { topics: true } } },
    });
    return recs.map((rec) => ({
      compositeScore: rec.compositeScore,
      skillMatchScore: rec.skillMatchScore,
      scoreBreakdown: rec.scoreBreakdown,
      generatedAt: rec.generatedAt,
      repository: toRepoListItem(rec.repository),
    }));
  }

  // Recompute this user's recommendations in the background.
  @Post('refresh')
  @HttpCode(202)
  async refresh(@CurrentUser() user: AuthUser) {
    await this.queue.add('recommend-user', { userId: user.userId });
    return { enqueued: true };
  }
}
