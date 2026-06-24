import {
  prisma,
  Prisma,
  type DifficultyLevel,
  type EstimatedTimeBucket,
  type HealthRating,
} from '@openpath/db';
import { computeHealth } from './health';
import { computeDifficulty } from './difficulty';
import { median } from './util';

/**
 * Scores an already-ingested repository: computes and stores its health score,
 * then the difficulty of each of its issues. Reads from and writes to Postgres
 * only (no GitHub calls). Idempotent.
 */
export async function scoreRepository(fullName: string) {
  const repo = await prisma.repository.findUnique({ where: { fullName } });
  if (!repo) {
    throw new Error(`Repository not found: ${fullName}. Ingest it first.`);
  }

  const issues = await prisma.issue.findMany({ where: { repositoryId: repo.id } });
  const resolutions = issues
    .map((i) => i.resolutionHours)
    .filter((v): v is number => v != null);

  const health = computeHealth({
    pushedAt: repo.pushedAt,
    stars: repo.stars,
    forks: repo.forks,
    totalIssues: issues.length,
    closedIssues: issues.filter((i) => i.state === 'closed').length,
    medianResolutionHours: median(resolutions),
    openIssuesCount: repo.openIssuesCount,
    now: new Date(),
  });

  await prisma.repository.update({
    where: { id: repo.id },
    data: {
      healthScore: health.score,
      healthRating: health.rating as HealthRating,
      healthBreakdown: health.breakdown as unknown as Prisma.InputJsonValue,
      lastScoredAt: new Date(),
    },
  });

  for (const issue of issues) {
    const d = computeDifficulty({
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
      commentsCount: issue.commentsCount,
    });
    await prisma.issue.update({
      where: { id: issue.id },
      data: {
        difficultyLevel: d.level as DifficultyLevel,
        difficultyScore: d.score,
        estimatedTimeBucket: d.estimatedTimeBucket as EstimatedTimeBucket,
        difficultyFeatures: d.features as unknown as Prisma.InputJsonValue,
        lastScoredAt: new Date(),
      },
    });
  }

  return {
    repositoryId: repo.id,
    health: { score: health.score, rating: health.rating },
    scoredIssues: issues.length,
  };
}
