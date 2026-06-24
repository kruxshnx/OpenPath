import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default async function Home() {
  const health = await apiGet<{ status: string; service: string }>('/health');

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="flex flex-col gap-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Find the right open-source project to contribute to.
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          OpenPath analyzes repository health, issue difficulty, and how well a
          project matches your skills — then recommends where you&apos;re most
          likely to land a successful first contribution.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/repositories"
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Browse repositories
          </Link>
          <Link
            href="/recommendations"
            className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            My recommendations
          </Link>
        </div>

        <div className="mt-4 text-sm">
          <span className="font-medium">API status: </span>
          {health ? (
            <span className="text-green-600">
              {health.status} ({health.service})
            </span>
          ) : (
            <span className="text-red-600">
              unreachable — start it with <code>npm run dev:api</code> (and a
              database)
            </span>
          )}
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Repository health',
            body: 'Activity, popularity, maintainer responsiveness, and issue management distilled into one score.',
          },
          {
            title: 'Issue difficulty',
            body: 'Every issue rated Beginner → Advanced with an effort estimate, beyond just labels.',
          },
          {
            title: 'Skill-matched',
            body: 'Recommendations ranked by how well a project fits your languages, frameworks, and interests.',
          },
        ].map((c) => (
          <div key={c.title} className="rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{c.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
