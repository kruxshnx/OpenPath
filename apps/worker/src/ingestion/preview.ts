import { config } from 'dotenv';
import { resolve } from 'node:path';
import { GithubClient } from '../github/github.client';
import { fetchRepositoryData } from './fetch';

// Fetch + map a repo from GitHub and print the result WITHOUT touching the
// database. Lets us verify the ingestion mapping against the real API.
//   npm run -w @openpath/worker preview -- owner/repo
config({ path: resolve(process.cwd(), '../../.env') });

async function main() {
  const fullName = process.argv[2] ?? 'octocat/Hello-World';
  const client = new GithubClient({ token: process.env.GITHUB_TOKEN });
  const data = await fetchRepositoryData(client, fullName);

  const closed = data.issues.filter((i) => i.resolutionHours != null);
  console.log(
    JSON.stringify(
      {
        repository: data.repository,
        languages: data.languages,
        topics: data.topics,
        issueCount: data.issues.length,
        closedIssuesWithResolution: closed.length,
        sampleIssues: data.issues.slice(0, 3).map((i) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          labels: i.labels,
          resolutionHours:
            i.resolutionHours != null
              ? Math.round(i.resolutionHours * 10) / 10
              : null,
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
