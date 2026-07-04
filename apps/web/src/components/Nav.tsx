import Link from 'next/link';
import { Compass, LayoutGrid, Sparkles, UserRound } from 'lucide-react';
import { auth, signIn, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { UserMenu } from '@/components/user-menu';

export async function Nav() {
  const session = await auth();
  const isAuthed = !!session?.user;

  async function doSignIn() {
    'use server';
    await signIn('github');
  }
  async function doSignOut() {
    'use server';
    await signOut();
  }

  return (
    <header className="glass-nav sticky top-0 z-40">
      <nav className="container flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <MobileNav
            isAuthed={isAuthed}
            signInAction={doSignIn}
            signOutAction={doSignOut}
          />
          <Link
            href="/"
            className="mr-2 flex items-center gap-2 font-semibold md:mr-4"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </span>
            <span className="tracking-tight">OpenPath</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/repositories">
                <LayoutGrid className="h-4 w-4" /> Repositories
              </Link>
            </Button>
            {isAuthed && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/recommendations">
                    <Sparkles className="h-4 w-4" /> Recommendations
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">
                    <UserRound className="h-4 w-4" /> Profile
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <UserMenu
              name={session?.user?.name ?? null}
              image={session?.user?.image ?? null}
              signOutAction={doSignOut}
            />
          ) : (
            <form action={doSignIn}>
              <Button size="sm">Sign in</Button>
            </form>
          )}
        </div>
      </nav>
    </header>
  );
}
