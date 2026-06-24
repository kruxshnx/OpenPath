import Link from 'next/link';
import { Compass, LayoutGrid, Sparkles, UserRound, LogOut } from 'lucide-react';
import { auth, signIn, signOut } from '@/auth';
import { ThemeToggle } from '@/components/theme-toggle';

export async function Nav() {
  const session = await auth();

  return (
    <header className="glass-nav sticky top-0 z-40">
      <nav className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <Link href="/" className="mr-4 flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </span>
            <span className="tracking-tight">OpenPath</span>
          </Link>

          <NavLink href="/repositories" icon={<LayoutGrid className="h-4 w-4" />}>
            Repositories
          </NavLink>
          {session?.user && (
            <>
              <NavLink href="/recommendations" icon={<Sparkles className="h-4 w-4" />}>
                Recommendations
              </NavLink>
              <NavLink href="/profile" icon={<UserRound className="h-4 w-4" />}>
                Profile
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
              className="flex items-center gap-2"
            >
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-7 w-7 rounded-full ring-1 ring-border"
                />
              )}
              <button
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                'use server';
                await signIn('github');
              }}
            >
              <button className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Sign in
              </button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
    >
      {icon}
      {children}
    </Link>
  );
}
