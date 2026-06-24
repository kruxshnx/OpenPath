import { config } from 'dotenv';
import { resolve } from 'node:path';
import { GithubClient } from '../github/github.client';
import { fetchRepositoryData } from '../ingestion/fetch';
import { computeHealth } from './health';
import { computeDifficulty } from './difficulty';
import { median, round } from './util';

// Fetch a repo from GitHub and run BOTH scorers on it, printing the result
// WITHOUT touching the database. Verifies the scoring heuristics on live data.
//   npm run -w @openpath/worker score-preview -- owner/repo
config({ path: resolve(process.cwd(), '../../.env') });

async function main() {
  const fullName = process.argv[2] ?? 'octocat/Hello-World';
  const client = new GithubClient({ token: process.env.GITHUB_TOKEN });
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

  const sampleDifficulties = data.issues.slice(0, 8).map((i) => {
    const d = computeDifficulty({
      title: i.title,
      body: i.body,
      labels: i.labels,
      commentsCount: i.commentsCount,
    });
    return {
      number: i.number,
      title: i.title.length > 60 ? `${i.title.slice(0, 57)}...` : i.title,
      labels: i.labels,
      level: d.level,
      score: d.score,
      eta: d.estimatedTimeBucket,
    };
  });

  console.log(
    JSON.stringify(
      {
        repo: data.repository.fullName,
        stars: data.repository.stars,
        medianResolutionHours:
          health.breakdown.responsiveness != null
            ? round(median(resolutions) ?? 0)
            : null,
        health,
        sampleDifficulties,
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
