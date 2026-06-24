import { revalidatePath } from 'next/cache';
import { UserRound } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { apiGet, API_URL } from '@/lib/api';
import type { Me, SkillDto } from '@/lib/types';

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
      <main className="container py-10">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="glass mt-4 rounded-2xl p-6 text-sm text-muted-foreground">
          Couldn&apos;t load your profile from the API (is the database up?).
        </p>
      </main>
    );
  }

  return (
    <main className="container max-w-3xl py-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as{' '}
            <span className="font-mono text-foreground">@{me.login}</span> — your
            skills drive recommendations.
          </p>
        </div>
      </div>

      <form action={save} className="mt-8 space-y-8">
        <Section title="Experience level">
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_LEVELS.map((lvl) => (
              <label key={lvl} className="cursor-pointer">
                <input
                  type="radio"
                  name="experienceLevel"
                  value={lvl}
                  defaultChecked={me.experienceLevel === lvl}
                  className="peer sr-only"
                />
                <span className="glass inline-flex rounded-xl px-4 py-2 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary hover:bg-card/80">
                  {lvl}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Interests">
          <div className="flex flex-wrap gap-2">
            {domains.map((d) => (
              <Chip
                key={d.id}
                name="interests"
                value={d.name}
                checked={myInterests.has(d.name)}
              />
            ))}
          </div>
        </Section>

        {techByType.map(({ type, items }) => (
          <Section key={type} title={TYPE_LABEL[type]}>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <Chip
                  key={s.id}
                  name="skills"
                  value={s.name}
                  checked={mySkillNames.has(s.name)}
                />
              ))}
            </div>
          </Section>
        ))}

        <button className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Save profile
        </button>
      </form>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({
  name,
  value,
  checked,
}: {
  name: string;
  value: string;
  checked: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span className="glass inline-flex rounded-full px-3 py-1.5 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary hover:bg-card/80">
        {value}
      </span>
    </label>
  );
}

function SignInGate() {
  return (
    <main className="container flex flex-col items-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <UserRound className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Profile</h1>
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
        <button className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Sign in with GitHub
        </button>
      </form>
    </main>
  );
}
