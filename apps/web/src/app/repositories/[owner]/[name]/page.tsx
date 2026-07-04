import Link from 'next/link';
import { ArrowLeft, CircleDot, ExternalLink, Github, GitFork, Star } from 'lucide-react';
import { apiGet } from '@/lib/api';
import type { RepoDetail } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
        <Card className="mt-6 p-12 text-center text-muted-foreground">
          <p className="font-medium text-foreground">
            {owner}/{name} isn&apos;t in OpenPath yet
          </p>
          <p className="mt-1 text-sm">Ingest it, then refresh this page.</p>
        </Card>
      </main>
    );
  }

  const ghUrl = `https://github.com/${repo.fullName}`;
  const totalBytes = repo.languages.reduce((a, l) => a + l.bytes, 0) || 1;
  const breakdown = (repo.healthBreakdown ?? {}) as Record<string, unknown>;

  return (
    <main className="container py-10">
      <BackLink />

      <Card className="mt-4 flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <HealthRing score={repo.healthScore} rating={repo.healthRating} size={92} />
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-xl font-bold tracking-tight break-words">
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
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <a href={ghUrl} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" /> View on GitHub
          </a>
        </Button>
      </Card>

      {repo.healthBreakdown && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BREAKDOWN_KEYS.map(([key, label]) => {
            const v = breakdown[key];
            const num = typeof v === 'number' ? v : null;
            return (
              <Card key={key} className="p-4">
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
              </Card>
            );
          })}
        </div>
      )}

      {repo.languages.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {repo.languages.slice(0, 8).map((l) => (
            <Badge key={l.language} variant="secondary" className="font-normal">
              {l.language}
              <span className="ml-1 font-mono text-muted-foreground">
                {Math.round((l.bytes / totalBytes) * 100)}%
              </span>
            </Badge>
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
          <Card className="mt-3 p-6 text-sm text-muted-foreground">
            No issues ingested (this repo may track issues elsewhere).
          </Card>
        ) : (
          <Card className="mt-3 divide-y divide-border/60 overflow-hidden p-0">
            {repo.issues.map((i) => (
              <a
                key={i.number}
                href={`${ghUrl}/issues/${i.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="font-mono text-muted-foreground">
                      #{i.number}
                    </span>{' '}
                    {i.title}
                    <ExternalLink className="ml-1 inline h-3 w-3 align-baseline text-muted-foreground" />
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
              </a>
            ))}
          </Card>
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
