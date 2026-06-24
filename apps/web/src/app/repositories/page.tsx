import Link from 'next/link';
import { CircleDot, GitFork, PackageOpen, Search, Star } from 'lucide-react';
import { apiGet } from '@/lib/api';
import type { RepoListResponse } from '@/lib/types';
import { HealthBadge } from '@/components/HealthBadge';

export default async function RepositoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; sort?: string }>;
}) {
  const { language, sort } = await searchParams;
  const qs = new URLSearchParams();
  if (language) qs.set('language', language);
  qs.set('sort', sort ?? 'health');

  const data = await apiGet<RepoListResponse>(`/repositories?${qs.toString()}`);

  return (
    <main className="container py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.total} analyzed` : 'Browse analyzed projects'} —
            sorted by health.
          </p>
        </div>

        <form className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="language"
              defaultValue={language ?? ''}
              placeholder="Language…"
              className="h-9 w-40 rounded-md border border-border bg-card pl-8 pr-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
          <select
            name="sort"
            defaultValue={sort ?? 'health'}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm outline-none ring-ring focus:ring-2"
          >
            <option value="health">Health</option>
            <option value="stars">Stars</option>
            <option value="recent">Recently pushed</option>
          </select>
          <button className="h-9 rounded-md border border-border bg-card px-3 text-sm transition-colors hover:bg-muted">
            Apply
          </button>
        </form>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.items.map((r) => (
            <Link
              key={r.id}
              href={`/repositories/${r.fullName}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-sm font-medium text-foreground group-hover:text-primary">
                  {r.fullName}
                </span>
                <HealthBadge score={r.healthScore} rating={r.healthRating} />
              </div>
              {r.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {r.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {r.primaryLanguage && (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    {r.primaryLanguage}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" /> {r.stars.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork className="h-3.5 w-3.5" /> {r.forks.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CircleDot className="h-3.5 w-3.5" />{' '}
                  {r.openIssuesCount.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <PackageOpen className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-medium">No repositories yet</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Start the worker and ingest one:{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          npm run -w @openpath/worker enqueue -- facebook/react
        </code>
      </p>
    </div>
  );
}
