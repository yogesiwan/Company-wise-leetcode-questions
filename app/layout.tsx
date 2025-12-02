import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'LeetCode Prep - Company Question Filter',
  description: 'Filter and search LeetCode questions by company, difficulty, and frequency',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <footer className="border-t border-white/10 bg-card/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/50">
              <div className="container mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
                  <span className="font-medium text-foreground/80">
                    Built for focused LeetCode company prep.
                  </span>
                  <span className="hidden sm:inline text-muted-foreground/70">
                    Curated questions up to Nov 2025.
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <a
                      href="https://github.com/yogesiwan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/yogesh-siwan-sde/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      LinkedIn
                    </a>
                    <a
                      href="mailto:yogesiwan@gmail.com"
                      className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      Email
                    </a>
                  </div>
                  <a
                    href="https://www.buymeacoffee.com/yogesiwan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary hover:bg-primary/15 active:bg-primary/20 transition-colors"
                  >
                    <span>Buy me a coffee</span>
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

