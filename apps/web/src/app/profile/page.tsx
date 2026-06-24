import { revalidatePath } from 'next/cache';
import { auth, signIn } from '@/auth';
import { apiGet, API_URL } from '@/lib/api';
import type { Me, SkillDto } from '@/lib/types';

const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-2 text-gray-600">Sign in to set up your profile.</p>
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

  const [me, skills] = await Promise.all([
    apiGet<Me>('/users/me', session.apiToken),
    apiGet<SkillDto[]>('/skills'),
  ]);

  const allSkills = skills ?? [];
  const domains = allSkills.filter((s) => s.type === 'DOMAIN');
  const techSkills = allSkills.filter((s) => s.type !== 'DOMAIN');
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
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          Couldn&apos;t load your profile from the API (is the database up?).
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Signed in as @{me.login}. Your skills drive recommendations.
      </p>

      <form action={save} className="mt-8 space-y-8">
        <div>
          <label className="block text-sm font-semibold">Experience level</label>
          <select
            name="experienceLevel"
            defaultValue={me.experienceLevel}
            className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Interests</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {domains.map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="interests"
                  value={d.name}
                  defaultChecked={myInterests.has(d.name)}
                />
                {d.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold">Skills</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {techSkills.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="skills"
                  value={s.name}
                  defaultChecked={mySkillNames.has(s.name)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>

        <button className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700">
          Save profile
        </button>
      </form>
    </main>
  );
}
