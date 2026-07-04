import type { Metadata } from 'next';
import { Fira_Sans, Fira_Code } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/Nav';

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenPath — Find where to contribute',
  description:
    'Intelligent open-source contribution discovery: repository health, issue difficulty, and skill-matched recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${firaSans.variable} ${firaCode.variable}`}
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Vibrant backdrop the frosted-glass surfaces blur through. */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -left-40 -top-40 h-[26rem] w-[26rem] rounded-full bg-indigo-500/25 blur-3xl dark:bg-indigo-500/30" />
            <div className="absolute -right-40 top-1/4 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/15 blur-3xl dark:bg-fuchsia-600/25" />
            <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-500/20" />
          </div>
          <Nav />
          {children}
          <footer className="mt-20 border-t border-border">
            <div className="container flex h-16 items-center justify-between text-xs text-muted-foreground">
              <span>OpenPath · open-source contribution intelligence</span>
              <span className="font-mono">M.Tech project</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
