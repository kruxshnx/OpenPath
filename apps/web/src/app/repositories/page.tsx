import Link from 'next/link';
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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Repositories</h1>
        <form className="flex items-center gap-2 text-sm">
          <input
            name="language"
            defaultValue={language ?? ''}
            placeholder="Language (e.g. TypeScript)"
            className="rounded-md border border-gray-300 px-3 py-1.5"
          />
          <select
            name="sort"
            defaultValue={sort ?? 'health'}
            className="rounded-md border border-gray-300 px-3 py-1.5"
          >
            <option value="health">Sort: Health</option>
            <option value="stars">Sort: Stars</option>
            <option value="recent">Sort: Recently pushed</option>
          </select>
          <button className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
            Apply
          </button>
        </form>
      </div>

      {!data || data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-6 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {data.items.map((r) => (
            <li key={r.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/repositories/${r.fullName}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {r.fullName}
                  </Link>
                  {r.description && (
                    <p className="mt-1 text-sm text-gray-600">{r.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {r.primaryLanguage && <span>{r.primaryLanguage}</span>}
                    <span>★ {r.stars.toLocaleString()}</span>
                    <span>{r.openIssuesCount.toLocaleString()} open issues</span>
                  </div>
                </div>
                <HealthBadge score={r.healthScore} rating={r.healthRating} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-10 text-center">
      <p className="text-gray-600">No repositories yet.</p>
      <p className="mt-2 text-sm text-gray-500">
        Start the database, then ingest one:{' '}
        <code>npm run -w @openpath/worker enqueue -- facebook/react</code> (with
        the worker running), or <code>POST /api/repositories/ingest</code>.
      </p>
    </div>
  );
}
