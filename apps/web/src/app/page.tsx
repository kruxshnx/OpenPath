import { auth, signIn, signOut } from '@/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

async function getApiHealth() {
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as { status: string; service: string };
  } catch {
    return null;
  }
}

async function getMe(apiToken?: string) {
  if (!apiToken) return null;
  try {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${apiToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as { login: string; name: string | null };
  } catch {
    return null;
  }
}

export default async function Home() {
  const [health, session] = await Promise.all([getApiHealth(), auth()]);
  const me = await getMe(session?.apiToken);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">OpenPath</h1>
      <p className="text-lg text-gray-600">
        Intelligent open-source contribution discovery &amp; recommendation.
      </p>

      <div className="rounded-lg border border-gray-200 p-4 text-sm">
        <span className="font-medium">API status: </span>
        {health ? (
          <span className="text-green-600">
            {health.status} ({health.service})
          </span>
        ) : (
          <span className="text-red-600">
            unreachable — start the API with <code>npm run dev:api</code>
          </span>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        {session?.user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{session.user.name}</div>
                <div className="text-sm text-gray-500">
                  {me
                    ? `synced to API as @${me.login}`
                    : 'signed in (API user not synced — is the DB up?)'}
                </div>
              </div>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <form
            action={async () => {
              'use server';
              await signIn('github');
            }}
          >
            <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
              Sign in with GitHub
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
