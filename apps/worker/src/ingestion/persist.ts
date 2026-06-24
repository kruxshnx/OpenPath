import { prisma } from '@openpath/db';
import type { RepositoryIngestData } from './types';

/**
 * Upserts a fetched repository (plus its languages, topics, and issues) into
 * Postgres. Idempotent: safe to re-run as repos are refreshed.
 */
export async function persistRepositoryData(
  data: RepositoryIngestData,
): Promise<{ repositoryId: string; issueCount: number }> {
  const { repository, languages, topics, issues } = data;
  const now = new Date();

  const repo = await prisma.repository.upsert({
    where: { githubId: BigInt(repository.githubId) },
    create: {
      githubId: BigInt(repository.githubId),
      fullName: repository.fullName,
      description: repository.description,
      primaryLanguage: repository.primaryLanguage,
      stars: repository.stars,
      forks: repository.forks,
      watchers: repository.watchers,
      openIssuesCount: repository.openIssuesCount,
      pushedAt: repository.pushedAt ? new Date(repository.pushedAt) : null,
      repoCreatedAt: repository.repoCreatedAt
        ? new Date(repository.repoCreatedAt)
        : null,
      archived: repository.archived,
      lastIngestedAt: now,
    },
    update: {
      description: repository.description,
      primaryLanguage: repository.primaryLanguage,
      stars: repository.stars,
      forks: repository.forks,
      watchers: repository.watchers,
      openIssuesCount: repository.openIssuesCount,
      pushedAt: repository.pushedAt ? new Date(repository.pushedAt) : null,
      archived: repository.archived,
      lastIngestedAt: now,
    },
  });

  // Languages and topics are small sets — replace them wholesale.
  await prisma.repositoryLanguage.deleteMany({ where: { repositoryId: repo.id } });
  if (languages.length) {
    await prisma.repositoryLanguage.createMany({
      data: languages.map((l) => ({
        repositoryId: repo.id,
        language: l.language,
        bytes: l.bytes,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.repositoryTopic.deleteMany({ where: { repositoryId: repo.id } });
  if (topics.length) {
    await prisma.repositoryTopic.createMany({
      data: topics.map((t) => ({ repositoryId: repo.id, topic: t })),
      skipDuplicates: true,
    });
  }

  for (const issue of issues) {
    await prisma.issue.upsert({
      where: { repositoryId_number: { repositoryId: repo.id, number: issue.number } },
      create: {
        githubId: BigInt(issue.githubId),
        repositoryId: repo.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels,
        commentsCount: issue.commentsCount,
        issueCreatedAt: new Date(issue.issueCreatedAt),
        closedAt: issue.closedAt ? new Date(issue.closedAt) : null,
        resolutionHours: issue.resolutionHours,
      },
      update: {
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels,
        commentsCount: issue.commentsCount,
        closedAt: issue.closedAt ? new Date(issue.closedAt) : null,
        resolutionHours: issue.resolutionHours,
      },
    });
  }

  return { repositoryId: repo.id, issueCount: issues.length };
}
