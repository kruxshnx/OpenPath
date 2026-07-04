import { config } from 'dotenv';
import { resolve } from 'node:path';
import { GithubClient } from '../github/github.client';
import { fetchRepositoryData } from '../ingestion/fetch';
import { computeHealth, popularityScore } from '../scoring/health';
import { computeDifficulty } from '../scoring/difficulty';
import { median } from '../scoring/util';
import type { DifficultyLevelLiteral } from '../scoring/types';
import { rankRepositories, type UserProfile, type CandidateRepo } from './recommend';

// Builds recommendations for a SYNTHETIC user from live GitHub data, no DB.
// Demonstrates the full Phase 3 pipeline: fetch -> health -> difficulty ->
// skill match -> rank.
//   npm run -w @openpath/worker recommend-preview -- facebook/react pallets/flask gin-gonic/gin
config({ path: resolve(process.cwd(), '../../.env') });

// An intermediate TypeScript/React web developer.
const USER: UserProfile = {
  skills: [
    { name: 'TypeScript', type: 'LANGUAGE', weight: 1 },
    { name: 'JavaScript', type: 'LANGUAGE', weight: 1 },
    { name: 'React', type: 'FRAMEWORK', weight: 1 },
    { name: 'Node.js', type: 'FRAMEWORK', weight: 1 },
    { name: 'Docker', type: 'TOOL', weight: 1 },
  ],
  experienceLevel: 'INTERMEDIATE',
  interests: ['Web Development'],
};

async function buildCandidate(
  client: GithubClient,
  fullName: string,
): Promise<CandidateRepo> {
  const data = await fetchRepositoryData(client, fullName);
  const resolutions = data.issues
    .map((i) => i.resolutionHours)
    .filter((v): v is number => v != null);

  const health = computeHealth({
    pushedAt: data.repository.pushedAt ? new Date(data.repository.pushedAt) : null,
    stars: data.repository.stars,
    forks: data.repository.forks,
    totalIssues: data.issues.length,
    closedIssues: data.issues.filter((i) => i.state === 'closed').length,
    medianResolutionHours: median(resolutions),
    openIssuesCount: data.repository.openIssuesCount,
    now: new Date(),
  });

  const issueDifficulties: DifficultyLevelLiteral[] = data.issues.map(
    (i) =>
      computeDifficulty({
        title: i.title,
        body: i.body,
        labels: i.labels,
        commentsCount: i.commentsCount,
      }).level,
  );

  return {
    id: fullName,
    fullName,
    signals: {
      primaryLanguage: data.repository.primaryLanguage,
      languages: data.languages,
      topics: data.topics,
    },
    health: health.score,
    popularity: popularityScore(data.repository.stars, data.repository.forks),
    issueDifficulties,
    topics: data.topics,
  };
}

async function main() {
  const repos = process.argv.slice(2);
  const targets = repos.length
    ? repos
    : ['facebook/react', 'pallets/flask', 'gin-gonic/gin'];

  const client = new GithubClient({ token: process.env.GITHUB_TOKEN });
  const candidates = await Promise.all(
    targets.map((r) => buildCandidate(client, r)),
  );
  const ranked = rankRepositories(USER, candidates);

  console.log(
    JSON.stringify(
      {
        user: {
          skills: USER.skills.map((s) => s.name),
          experienceLevel: USER.experienceLevel,
          interests: USER.interests,
        },
        recommendations: ranked.map((r) => ({
          rank: ranked.indexOf(r) + 1,
          repo: r.fullName,
          compositeScore: r.compositeScore,
          factors: r.factors,
          matchedSkills: r.skillMatch.matched,
          suitableIssues: r.issueFit.suitableCount,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
