import Link from 'next/link';
import { Activity, ArrowRight, Gauge, Sparkles, Target } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { TypographyH1, TypographyLead } from '@/components/ui/typography';

export default async function Home() {
  const health = await apiGet<{ status: string; service: string }>('/health');

  return (
    <main>
      <section>
        <div className="container flex flex-col items-center gap-6 py-24 text-center">
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
            {health ? 'API online' : 'API offline'}
          </span>

          <TypographyH1 className="max-w-3xl leading-tight sm:text-5xl">
            Find the right open-source project to contribute to.
          </TypographyH1>
          <TypographyLead className="max-w-2xl text-pretty">
            OpenPath analyzes repository health, estimates issue difficulty, and
            matches projects to your skills — so your next contribution actually
            lands.
          </TypographyLead>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/repositories"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
            >
              Browse repositories
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/recommendations"
              className="glass inline-flex h-11 items-center rounded-xl px-6 text-sm font-medium transition-colors hover:bg-card/80"
            >
              My recommendations
            </Link>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 pb-8 sm:grid-cols-3">
        {[
          {
            icon: <Gauge className="h-5 w-5" />,
            title: 'Repository health',
            body: 'Activity, popularity, maintainer responsiveness, and issue management distilled into one score.',
          },
          {
            icon: <Activity className="h-5 w-5" />,
            title: 'Issue difficulty',
            body: 'Every issue rated Beginner → Advanced with an effort estimate — well beyond GitHub labels.',
          },
          {
            icon: <Target className="h-5 w-5" />,
            title: 'Skill-matched',
            body: 'Recommendations ranked by how well a project fits your languages, frameworks, and interests.',
          },
        ].map((c) => (
          <div
            key={c.title}
            className="glass rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {c.icon}
            </div>
            <h3 className="mt-4 font-semibold">{c.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </section>

      <section className="container pb-4">
        <div className="glass flex items-center gap-3 rounded-2xl p-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <span>
            New here? Sign in with GitHub, set your skills on the Profile page,
            and hit Refresh on Recommendations.
          </span>
        </div>
      </section>
    </main>
  );
}
