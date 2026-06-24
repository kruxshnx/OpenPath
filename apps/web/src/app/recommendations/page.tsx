import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { RefreshCw, Sparkles } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { apiGet, API_URL } from '@/lib/api';
import type { RecommendationDto } from '@/lib/types';
import { HealthBadge } from '@/components/HealthBadge';
import { FactorBars } from '@/components/FactorBars';

export default async function RecommendationsPage() {
  const session = await auth();

  if (!session?.user) {
    return <SignInGate />;
  }

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
          <h1 className="text-2xl font-bold tracking-tight">
            Your recommendations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by how well each project fits your skills.
          </p>
        </div>
        <form action={refresh}>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm transition-colors hover:bg-muted">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </form>
      </div>

      {recs.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
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
        <ol className="mt-6 space-y-3">
          {recs.map((rec, idx) => (
            <li
              key={rec.repository.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <Link
                      href={`/repositories/${rec.repository.fullName}`}
                      className="font-mono text-sm font-medium hover:text-primary"
                    >
                      {rec.repository.fullName}
                    </Link>
                    <HealthBadge
                      score={rec.repository.healthScore}
                      rating={rec.repository.healthRating}
                    />
                  </div>
                  {rec.repository.description && (
                    <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">
                      {rec.repository.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-44">
                    <FactorBars factors={rec.scoreBreakdown} />
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-bold tabular-nums text-primary">
                      {Math.round(rec.compositeScore)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      match
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function SignInGate() {
  return (
    <main className="container flex flex-col items-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Your recommendations
      </h1>
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
        <button className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Sign in with GitHub
        </button>
      </form>
    </main>
  );
}
