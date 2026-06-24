import Link from 'next/link';
import { ArrowLeft, CircleDot, GitFork, Star } from 'lucide-react';
import { apiGet } from '@/lib/api';
import type { RepoDetail } from '@/lib/types';
import { HealthRing } from '@/components/HealthRing';
import { DifficultyChip } from '@/components/DifficultyChip';

const BREAKDOWN_KEYS: [string, string][] = [
  ['activity', 'Activity'],
  ['popularity', 'Popularity'],
  ['responsiveness', 'Responsiveness'],
  ['issueManagement', 'Issue mgmt'],
];

export default async function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  const { owner, name } = await params;
  const repo = await apiGet<RepoDetail>(`/repositories/${owner}/${name}`);

  if (!repo) {
    return (
      <main className="container py-10">
        <BackLink />
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
          <p className="font-medium text-foreground">
            {owner}/{name} isn&apos;t in OpenPath yet
          </p>
          <p className="mt-1 text-sm">Ingest it, then refresh this page.</p>
        </div>
      </main>
    );
  }

  const totalBytes = repo.languages.reduce((a, l) => a + l.bytes, 0) || 1;
  const breakdown = (repo.healthBreakdown ?? {}) as Record<string, unknown>;

  return (
    <main className="container py-10">
      <BackLink />

      <div className="mt-4 flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <HealthRing score={repo.healthScore} rating={repo.healthRating} size={92} />
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-xl font-bold tracking-tight">
            {repo.fullName}
          </h1>
          {repo.description && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {repo.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {repo.primaryLanguage && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/70" />
                {repo.primaryLanguage}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4" /> {repo.stars.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GitFork className="h-4 w-4" /> {repo.forks.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="h-4 w-4" />{' '}
              {repo.openIssuesCount.toLocaleString()} open
            </span>
          </div>
        </div>
      </div>

      {repo.healthBreakdown && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BREAKDOWN_KEYS.map(([key, label]) => {
            const v = breakdown[key];
            const num = typeof v === 'number' ? v : null;
            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                  {num ?? '—'}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${num ?? 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {repo.languages.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {repo.languages.slice(0, 8).map((l) => (
            <span
              key={l.language}
              className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
            >
              {l.language}{' '}
              <span className="font-mono text-foreground">
                {Math.round((l.bytes / totalBytes) * 100)}%
              </span>
            </span>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Issues{' '}
          <span className="font-mono text-sm text-muted-foreground">
            {repo.issues.length}
          </span>
        </h2>
        {repo.issues.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
            No issues ingested (this repo may track issues elsewhere).
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {repo.issues.map((i) => (
              <li
                key={i.number}
                className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="font-mono text-muted-foreground">
                      #{i.number}
                    </span>{' '}
                    {i.title}
                  </div>
                  {i.labels.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {i.labels.slice(0, 5).map((l) => (
                        <span
                          key={l}
                          className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <DifficultyChip
                  level={i.difficultyLevel}
                  eta={i.estimatedTimeBucket}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/repositories"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Repositories
    </Link>
  );
}
