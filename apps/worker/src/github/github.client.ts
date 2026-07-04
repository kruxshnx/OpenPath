export interface GithubClientOptions {
  token?: string;
  userAgent?: string;
}

// Thin wrapper over the GitHub REST API using global fetch. Works unauthenticated
// (60 req/hr) or authenticated via a token (5,000 req/hr — the limit the worker's
// BullMQ rate-limiter is sized against).
export class GithubClient {
  private readonly base = 'https://api.github.com';

  constructor(private readonly opts: GithubClientOptions = {}) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': this.opts.userAgent ?? 'OpenPath-Ingestion',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.opts.token) h.Authorization = `Bearer ${this.opts.token}`;
    return h;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.base}${path}`, { headers: this.headers() });

    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      const reset = res.headers.get('x-ratelimit-reset');
      const resetAt = reset ? new Date(Number(reset) * 1000).toISOString() : 'unknown';
      // Throwing lets BullMQ retry with backoff after the window resets.
      throw new Error(`GitHub rate limit exhausted; resets at ${resetAt}`);
    }
    if (!res.ok) {
      throw new Error(`GitHub ${path} -> ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }
}
