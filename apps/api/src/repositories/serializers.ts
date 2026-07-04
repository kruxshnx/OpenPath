import type {
  Issue,
  Maintainer,
  Repository,
  RepositoryLanguage,
  RepositoryTopic,
} from '@openpath/db';

export function toRepoListItem(
  r: Repository & { topics?: RepositoryTopic[] },
) {
  return {
    id: r.id,
    fullName: r.fullName,
    description: r.description,
    primaryLanguage: r.primaryLanguage,
    stars: r.stars,
    forks: r.forks,
    openIssuesCount: r.openIssuesCount,
    healthScore: r.healthScore,
    healthRating: r.healthRating,
    topics: r.topics?.map((t) => t.topic) ?? [],
  };
}

export function toIssueDto(i: Issue) {
  return {
    number: i.number,
    title: i.title,
    state: i.state,
    labels: i.labels,
    commentsCount: i.commentsCount,
    issueCreatedAt: i.issueCreatedAt,
    closedAt: i.closedAt,
    resolutionHours: i.resolutionHours,
    difficultyLevel: i.difficultyLevel,
    difficultyScore: i.difficultyScore,
    estimatedTimeBucket: i.estimatedTimeBucket,
  };
}

export function toRepoDetail(
  r: Repository & {
    languages: RepositoryLanguage[];
    topics: RepositoryTopic[];
    maintainers: Maintainer[];
    issues: Issue[];
  },
) {
  return {
    ...toRepoListItem(r),
    watchers: r.watchers,
    pushedAt: r.pushedAt,
    repoCreatedAt: r.repoCreatedAt,
    lastScoredAt: r.lastScoredAt,
    healthBreakdown: r.healthBreakdown,
    languages: r.languages
      .sort((a, b) => b.bytes - a.bytes)
      .map((l) => ({ language: l.language, bytes: l.bytes })),
    maintainers: r.maintainers.map((m) => ({
      login: m.githubLogin,
      friendlinessScore: m.friendlinessScore,
    })),
    issues: r.issues.map(toIssueDto),
  };
}
