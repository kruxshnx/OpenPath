import { GithubClient } from '../github/github.client';
import type {
  MappedIssue,
  MappedRepository,
  RepositoryIngestData,
} from './types';

// Minimal shapes of the GitHub responses (only the fields we use).
interface GhRepo {
  id: number;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  created_at: string | null;
  archived: boolean;
  topics?: string[];
}

interface GhIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  labels: Array<{ name: string } | string>;
  comments: number;
  created_at: string;
  closed_at: string | null;
  pull_request?: unknown; // present means it's a PR, not an issue
}

// Cap the issue crawl for the MVP (3 pages × 100 = up to 300 issues/repo).
const ISSUE_PAGE_CAP = 3;
const HOUR_MS = 1000 * 60 * 60;

/**
 * Fetches a repository, its languages, topics, and recent issues from GitHub and
 * maps them to plain DTOs. No database access — pure fetch + transform.
 */
export async function fetchRepositoryData(
  client: GithubClient,
  fullName: string,
): Promise<RepositoryIngestData> {
  const repo = await client.get<GhRepo>(`/repos/${fullName}`);
  const languages = await client.get<Record<string, number>>(
    `/repos/${fullName}/languages`,
  );

  const rawIssues: GhIssue[] = [];
  for (let page = 1; page <= ISSUE_PAGE_CAP; page++) {
    const batch = await client.get<GhIssue[]>(
      `/repos/${fullName}/issues?state=all&per_page=100&page=${page}`,
    );
    rawIssues.push(...batch);
    if (batch.length < 100) break;
  }

  return {
    repository: mapRepository(repo),
    languages: Object.entries(languages).map(([language, bytes]) => ({
      language,
      bytes,
    })),
    topics: repo.topics ?? [],
    // The issues endpoint returns PRs too; drop anything with a pull_request key.
    issues: rawIssues.filter((i) => !i.pull_request).map(mapIssue),
  };
}

function mapRepository(r: GhRepo): MappedRepository {
  return {
    githubId: r.id,
    fullName: r.full_name,
    description: r.description,
    primaryLanguage: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.watchers_count,
    openIssuesCount: r.open_issues_count,
    pushedAt: r.pushed_at,
    repoCreatedAt: r.created_at,
    archived: r.archived,
  };
}

function mapIssue(i: GhIssue): MappedIssue {
  const resolutionHours =
    i.closed_at != null
      ? (new Date(i.closed_at).getTime() - new Date(i.created_at).getTime()) /
        HOUR_MS
      : null;

  return {
    githubId: i.id,
    number: i.number,
    title: i.title,
    body: i.body,
    state: i.state,
    labels: i.labels.map((l) => (typeof l === 'string' ? l : l.name)),
    commentsCount: i.comments,
    issueCreatedAt: i.created_at,
    closedAt: i.closed_at,
    resolutionHours,
  };
}
