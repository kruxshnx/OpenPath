import { revalidatePath } from 'next/cache';
import { UserRound } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { apiGet, API_URL } from '@/lib/api';
import type { Me, SkillDto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TypographyH1 } from '@/components/ui/typography';

const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const TYPE_LABEL: Record<string, string> = {
  LANGUAGE: 'Languages',
  FRAMEWORK: 'Frameworks',
  TOOL: 'Tools',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return <SignInGate />;

  const [me, skills] = await Promise.all([
    apiGet<Me>('/users/me', session.apiToken),
    apiGet<SkillDto[]>('/skills'),
  ]);

  const allSkills = skills ?? [];
  const domains = allSkills.filter((s) => s.type === 'DOMAIN');
  const techByType = (['LANGUAGE', 'FRAMEWORK', 'TOOL'] as const).map((t) => ({
    type: t,
    items: allSkills.filter((s) => s.type === t),
  }));
  const mySkillNames = new Set(me?.skills?.map((s) => s.name) ?? []);
  const myInterests = new Set(me?.interests ?? []);

  async function save(formData: FormData) {
    'use server';
    const s = await auth();
    if (!s?.apiToken) return;
    await fetch(`${API_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${s.apiToken}`,
      },
      body: JSON.stringify({
        experienceLevel: formData.get('experienceLevel'),
        interests: formData.getAll('interests'),
        skills: formData.getAll('skills'),
      }),
    });
    revalidatePath('/profile');
  }

  if (!me) {
    return (
      <main className="container max-w-3xl py-10">
        <TypographyH1 className="text-3xl">Profile</TypographyH1>
        <Card className="mt-4 p-6 text-sm text-muted-foreground">
          Couldn&apos;t load your profile from the API (is the database up?).
        </Card>
      </main>
    );
  }

  return (
    <main className="container max-w-3xl py-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <TypographyH1 className="text-3xl">Profile</TypographyH1>
          <p className="text-sm text-muted-foreground">
            Signed in as{' '}
            <span className="font-mono text-foreground">@{me.login}</span> — your
            skills drive recommendations.
          </p>
        </div>
      </div>

      <form action={save} className="mt-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience level</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((lvl) => (
              <Chip
                key={lvl}
                name="experienceLevel"
                type="radio"
                value={lvl}
                checked={me.experienceLevel === lvl}
                shape="rounded"
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Interests</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <Chip
                key={d.id}
                name="interests"
                type="checkbox"
                value={d.name}
                checked={myInterests.has(d.name)}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {techByType.map(({ type, items }) => (
              <div key={type}>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  {TYPE_LABEL[type]}
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((s) => (
                    <Chip
                      key={s.id}
                      name="skills"
                      type="checkbox"
                      value={s.name}
                      checked={mySkillNames.has(s.name)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save profile
        </Button>
      </form>
    </main>
  );
}

function Chip({
  name,
  type,
  value,
  checked,
  shape = 'pill',
}: {
  name: string;
  type: 'radio' | 'checkbox';
  value: string;
  checked: boolean;
  shape?: 'pill' | 'rounded';
}) {
  return (
    <label className="cursor-pointer">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span
        className={`inline-flex items-center border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-accent peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${shape === 'pill' ? 'rounded-full' : 'rounded-md'}`}
      >
        {value}
      </span>
    </label>
  );
}

function SignInGate() {
  return (
    <main className="container flex flex-col items-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <UserRound className="h-6 w-6" />
      </div>
      <TypographyH1 className="mt-4 text-3xl">Profile</TypographyH1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Sign in to set up your skills and experience level.
      </p>
      <form
        action={async () => {
          'use server';
          await signIn('github');
        }}
        className="mt-6"
      >
        <Button size="lg">Sign in with GitHub</Button>
      </form>
    </main>
  );
}
