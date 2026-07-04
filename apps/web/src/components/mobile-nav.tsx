'use client';

import Link from 'next/link';
import {
  Compass,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function MobileNav({
  isAuthed,
  signInAction,
  signOutAction,
}: {
  isAuthed: boolean;
  signInAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </span>
            OpenPath
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col gap-1">
          <NavItem href="/repositories" icon={LayoutGrid}>
            Repositories
          </NavItem>
          {isAuthed && (
            <>
              <NavItem href="/recommendations" icon={Sparkles}>
                Recommendations
              </NavItem>
              <NavItem href="/profile" icon={UserRound}>
                Profile
              </NavItem>
            </>
          )}
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          {isAuthed ? (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => signOutAction()}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button
              className="w-full justify-start gap-2"
              onClick={() => signInAction()}
            >
              <LogIn className="h-4 w-4" /> Sign in with GitHub
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NavItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </Link>
    </SheetClose>
  );
}
