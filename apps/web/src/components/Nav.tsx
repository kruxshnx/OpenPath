import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            OpenPath
          </Link>
          <Link href="/repositories" className="text-sm text-gray-600 hover:text-gray-900">
            Repositories
          </Link>
          {session?.user && (
            <>
              <Link
                href="/recommendations"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Recommendations
              </Link>
              <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                Profile
              </Link>
            </>
          )}
        </div>

        {session?.user ? (
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-gray-500">{session.user.name}</span>
            <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
              Sign out
            </button>
          </form>
        ) : (
          <form
            action={async () => {
              'use server';
              await signIn('github');
            }}
          >
            <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700">
              Sign in with GitHub
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}
