import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { auth, signIn } from '@/auth';
import { apiGet, API_URL } from '@/lib/api';
import type { RecommendationDto } from '@/lib/types';
import { HealthBadge } from '@/components/HealthBadge';

export default async function RecommendationsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Your recommendations</h1>
        <p className="mt-2 text-gray-600">
          Sign in with GitHub to get personalized recommendations.
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('github');
          }}
          className="mt-6"
        >
          <button className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
            Sign in with GitHub
          </button>
        </form>
      </main>
    );
  }

  const recs =
    (await apiGet<RecommendationDto[]>('/recommendations', session.apiToken)) ?? [];

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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your recommendations</h1>
        <form action={refresh}>
          <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            Refresh
          </button>
        </form>
      </div>

      {recs.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600">No recommendations yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            Set your skills on the{' '}
            <Link href="/profile" className="underline">
              Profile
            </Link>{' '}
            page, make sure some repositories are ingested, then click Refresh.
          </p>
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {recs.map((rec, idx) => (
            <li
              key={rec.repository.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">#{idx + 1}</span>
                    <Link
                      href={`/repositories/${rec.repository.fullName}`}
                      className="font-medium hover:underline"
                    >
                      {rec.repository.fullName}
                    </Link>
                    <HealthBadge
                      score={rec.repository.healthScore}
                      rating={rec.repository.healthRating}
                    />
                  </div>
                  {rec.scoreBreakdown && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      {Object.entries(rec.scoreBreakdown).map(([k, v]) => (
                        <span key={k}>
                          {k}: <span className="font-medium text-gray-700">{v}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{rec.compositeScore}</div>
                  <div className="text-xs text-gray-400">match score</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
