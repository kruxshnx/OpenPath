import { GithubClient } from '../github/github.client';
import { fetchRepositoryData } from './fetch';
import { persistRepositoryData } from './persist';

/**
 * Full ingestion of one repository: fetch from GitHub, then persist to Postgres.
 * Used by the worker's job processor.
 */
export async function ingestRepository(fullName: string, token?: string) {
  const client = new GithubClient({ token: token ?? process.env.GITHUB_TOKEN });
  const data = await fetchRepositoryData(client, fullName);
  return persistRepositoryData(data);
}

export { fetchRepositoryData } from './fetch';
export { GithubClient } from '../github/github.client';
export type { RepositoryIngestData } from './types';
