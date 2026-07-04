import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@openpath/db';
import { PrismaService } from '../prisma/prisma.service';
import { toRepoDetail, toRepoListItem } from './serializers';

export interface ListParams {
  language?: string;
  minHealth?: number;
  sort: 'health' | 'stars' | 'recent';
  order: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

@Injectable()
export class RepositoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: ListParams) {
    const where: Prisma.RepositoryWhereInput = { archived: false };
    if (params.language) where.primaryLanguage = params.language;
    if (params.minHealth != null) where.healthScore = { gte: params.minHealth };

    const orderBy: Prisma.RepositoryOrderByWithRelationInput =
      params.sort === 'stars'
        ? { stars: params.order }
        : params.sort === 'recent'
          ? { pushedAt: params.order }
          : { healthScore: { sort: params.order, nulls: 'last' } };

    const [items, total] = await Promise.all([
      this.prisma.repository.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: { topics: true },
      }),
      this.prisma.repository.count({ where }),
    ]);

    return {
      items: items.map(toRepoListItem),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async detail(fullName: string) {
    const repo = await this.prisma.repository.findUnique({
      where: { fullName },
      include: {
        languages: true,
        topics: true,
        maintainers: true,
        issues: { orderBy: { number: 'desc' }, take: 100 },
      },
    });
    if (!repo) {
      throw new NotFoundException(`Repository not found: ${fullName}`);
    }
    return toRepoDetail(repo);
  }
}
