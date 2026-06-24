// Plain DTOs produced by the fetch/map layer. Kept free of any Prisma import so
// the fetch + preview path never constructs a PrismaClient (and so the mapping
// logic is unit-testable without a database).

export interface MappedRepository {
  githubId: number;
  fullName: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssuesCount: number;
  pushedAt: string | null;
  repoCreatedAt: string | null;
  archived: boolean;
}

export interface MappedIssue {
  githubId: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  labels: string[];
  commentsCount: number;
  issueCreatedAt: string;
  closedAt: string | null;
  // Research label (docs/RESEARCH.md §2): hours from open to close, for closed issues.
  resolutionHours: number | null;
}

export interface MappedLanguage {
  language: string;
  bytes: number;
}

export interface RepositoryIngestData {
  repository: MappedRepository;
  languages: MappedLanguage[];
  topics: string[];
  issues: MappedIssue[];
}
