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
