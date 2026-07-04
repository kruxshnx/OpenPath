import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { RepositoriesService } from './repositories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { INGESTION_QUEUE } from '../queue/queue.module';

@Controller('repositories')
export class RepositoriesController {
  constructor(
    private readonly repos: RepositoriesService,
    @Inject(INGESTION_QUEUE) private readonly queue: Queue,
  ) {}

  @Get()
  list(
    @Query('language') language?: string,
    @Query('minHealth') minHealth?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.repos.list({
      language,
      minHealth: minHealth != null ? Number(minHealth) : undefined,
      sort: sort === 'stars' || sort === 'recent' ? sort : 'health',
      order: order === 'asc' ? 'asc' : 'desc',
      page: Math.max(1, Number(page) || 1),
      pageSize: Math.min(50, Math.max(1, Number(pageSize) || 20)),
    });
  }

  // Enqueue a repo for ingestion (then the worker chains scoring).
  @Post('ingest')
  @UseGuards(JwtAuthGuard)
  async ingest(@Body() body: { fullName?: string }) {
    if (!body?.fullName || !body.fullName.includes('/')) {
      throw new BadRequestException('fullName "owner/repo" is required');
    }
    await this.queue.add(
      'ingest-repo',
      { fullName: body.fullName },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    return { enqueued: body.fullName };
  }

  @Get(':owner/:name')
  detail(@Param('owner') owner: string, @Param('name') name: string) {
    return this.repos.detail(`${owner}/${name}`);
  }
}
