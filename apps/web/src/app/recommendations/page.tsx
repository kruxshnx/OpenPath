import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import {
  CircleDot,
  ExternalLink,
  Github,
  RefreshCw,
  Sparkles,
  Star,
} from 'lucide-react';
import { auth, signIn } from '@/auth';
import { apiGet, API_URL } from '@/lib/api';
import type { RecommendationDto } from '@/lib/types';
import { HealthBadge } from '@/components/HealthBadge';
import { FactorBars } from '@/components/FactorBars';
import { TypographyH1 } from '@/components/ui/typography';

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session?.user) return <SignInGate />;

  const recs =
    (await apiGet<RecommendationDto[]>('/recommendations', session.apiToken)) ??
    [];

  async function refresh() {
    'use server';
    const s = await auth();
    if (!s?.apiToken) return;
    await fetch(`${API_URL}/api/recommendations/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${s.apiToken}` },
    });
    revalidatePath('/recommendations');
  }

  return (
    <main className="container py-10">
      <div className="flex items-center justify-between">
        <div>
          <TypographyH1 className="text-3xl">Your recommendations</TypographyH1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by how well each project fits your skills.
          </p>
        </div>
        <form action={refresh}>
          <button className="glass inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm transition-colors hover:bg-card/80">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </form>
      </div>

      {recs.length === 0 ? (
        <div className="glass mt-6 flex flex-col items-center rounded-2xl p-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No recommendations yet</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Set your skills on the{' '}
            <Link href="/profile" className="text-primary hover:underline">
              Profile
            </Link>{' '}
            page, make sure repositories are ingested, then click Refresh.
          </p>
        </div>
      ) : (
        <ol className="mt-6 space-y-4">
          {recs.map((rec, idx) => {
            const sb = (rec.scoreBreakdown ?? {}) as Record<string, unknown>;
            // New rows: { factors, matchedSkills, suitableIssues }. Old rows: flat factors.
            const factors = (sb.factors ?? sb) as Record<string, number>;
            const matched = (
              Array.isArray(sb.matchedSkills) ? sb.matchedSkills : []
            ) as string[];
            const suitable =
              typeof sb.suitableIssues === 'number' ? sb.suitableIssues : null;
            const ghUrl = `https://github.com/${rec.repository.fullName}`;

            return (
              <li key={rec.repository.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 font-mono text-xs font-semibold text-primary">
                        {idx + 1}
                      </span>
                      <a
                        href={ghUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-sm font-medium hover:text-primary"
                      >
                        {rec.repository.fullName}
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                      <HealthBadge
                        score={rec.repository.healthScore}
                        rating={rec.repository.healthRating}
                      />
                    </div>

                    {rec.repository.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {rec.repository.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {rec.repository.primaryLanguage && (
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-primary/70" />
                          {rec.repository.primaryLanguage}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5" />{' '}
                        {rec.repository.stars.toLocaleString()}
                      </span>
                      {suitable != null && suitable > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CircleDot className="h-3.5 w-3.5" />
                          {suitable} issues match your level
                        </span>
                      )}
                    </div>

                    {matched.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          Matched:
                        </span>
                        {matched.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={ghUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
                      >
                        <Github className="h-4 w-4" /> View on GitHub
                      </a>
                      <Link
                        href={`/repositories/${rec.repository.fullName}`}
                        className="glass inline-flex h-9 items-center rounded-xl px-4 text-sm transition-colors hover:bg-card/80"
                      >
                        Details
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 lg:flex-col-reverse lg:items-end lg:justify-between">
                    <div className="w-48">
                      <FactorBars factors={factors} />
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-4xl font-bold tabular-nums text-primary">
                        {Math.round(rec.compositeScore)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        match score
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}

function SignInGate() {
  return (
    <main className="container flex flex-col items-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <TypographyH1 className="mt-4 text-3xl">Your recommendations</TypographyH1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Sign in with GitHub to get personalized, skill-matched recommendations.
      </p>
      <form
        action={async () => {
          'use server';
          await signIn('github');
        }}
        className="mt-6"
      >
        <button className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90">
          Sign in with GitHub
        </button>
      </form>
    </main>
  );
}
