import Link from 'next/link';
import { Activity, ArrowRight, Gauge, Sparkles, Target } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TypographyH1, TypographyLead } from '@/components/ui/typography';

const FEATURES = [
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
];

export default async function Home() {
  const health = await apiGet<{ status: string; service: string }>('/health');

  return (
    <main>
      <section>
        <div className="container flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <Badge variant="outline" className="gap-1.5 rounded-full py-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
            {health ? 'API online' : 'API offline'}
          </Badge>

          <TypographyH1 className="max-w-3xl leading-tight sm:text-5xl">
            Find the right open-source project to contribute to.
          </TypographyH1>
          <TypographyLead className="max-w-2xl text-pretty">
            OpenPath analyzes repository health, estimates issue difficulty, and
            matches projects to your skills — so your next contribution actually
            lands.
          </TypographyLead>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/repositories">
                Browse repositories <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/recommendations">My recommendations</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 pb-8 sm:grid-cols-3">
        {FEATURES.map((c) => (
          <Card key={c.title} className="transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                {c.icon}
              </div>
              <CardTitle className="pt-2 text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {c.body}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container pb-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            New here? Sign in with GitHub, set your skills on the Profile page,
            and hit Refresh on Recommendations.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
