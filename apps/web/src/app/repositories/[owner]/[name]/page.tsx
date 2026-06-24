import Link from 'next/link';
import { apiGet } from '@/lib/api';
import type { RepoDetail } from '@/lib/types';
import { HealthBadge } from '@/components/HealthBadge';
import { DifficultyChip } from '@/components/DifficultyChip';

export default async function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  const { owner, name } = await params;
  const repo = await apiGet<RepoDetail>(`/repositories/${owner}/${name}`);

  if (!repo) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/repositories" className="text-sm text-gray-500 hover:underline">
          ← Repositories
        </Link>
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600">
          <p>
            <span className="font-medium">
              {owner}/{name}
            </span>{' '}
            isn&apos;t in OpenPath yet (or the API/database is down).
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Ingest it, then refresh this page.
          </p>
        </div>
      </main>
    );
  }

  const totalBytes = repo.languages.reduce((a, l) => a + l.bytes, 0) || 1;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/repositories" className="text-sm text-gray-500 hover:underline">
        ← Repositories
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{repo.fullName}</h1>
          {repo.description && (
            <p className="mt-1 text-gray-600">{repo.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 text-sm text-gray-500">
            {repo.primaryLanguage && <span>{repo.primaryLanguage}</span>}
            <span>★ {repo.stars.toLocaleString()}</span>
            <span>{repo.forks.toLocaleString()} forks</span>
            <span>{repo.openIssuesCount.toLocaleString()} open issues</span>
          </div>
        </div>
        <HealthBadge score={repo.healthScore} rating={repo.healthRating} />
      </div>

      {repo.healthBreakdown && (
        <section className="mt-6 rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700">Health breakdown</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {(['activity', 'popularity', 'responsiveness', 'issueManagement'] as const).map(
              (k) => {
                const v = (repo.healthBreakdown as Record<string, unknown>)[k];
                return (
                  <div key={k} className="rounded-md bg-gray-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {k}
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {typeof v === 'number' ? v : '—'}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>
      )}

      {repo.languages.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700">Languages</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
            {repo.languages.slice(0, 8).map((l) => (
              <span key={l.language} className="rounded bg-gray-100 px-2 py-1">
                {l.language} {Math.round((l.bytes / totalBytes) * 100)}%
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Issues ({repo.issues.length})</h2>
        {repo.issues.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No issues ingested.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200">
            {repo.issues.map((i) => (
              <li key={i.number} className="flex items-start justify-between gap-4 p-3">
                <div>
                  <div className="text-sm">
                    <span className="text-gray-400">#{i.number}</span> {i.title}
                  </div>
                  {i.labels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {i.labels.slice(0, 5).map((l) => (
                        <span
                          key={l}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <DifficultyChip level={i.difficultyLevel} eta={i.estimatedTimeBucket} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
