import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';

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
        <AuthProvider>
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
              <footer className="relative border-t border-border/30 dark:border-border/20 bg-gradient-to-b from-card/80 via-card/85 to-card/90 dark:from-card/70 dark:via-card/75 dark:to-card/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/60 dark:supports-[backdrop-filter]:bg-card/50 shadow-[0_-1px_0_0_rgba(255,255,255,0.1)_inset,0_1px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_0_0_rgba(255,255,255,0.05)_inset,0_1px_20px_rgba(0,0,0,0.3)]">
                {/* Subtle bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                
                <div className="container mx-auto px-4 py-6 sm:py-8 relative">
                  <div className="flex flex-col gap-6 sm:gap-8">
                    {/* Main content row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                      {/* Left section - Description */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                        <span className="text-xs sm:text-sm font-medium text-foreground/90">
                          Built for company specific LeetCode prep.
                        </span>
                        <span className="hidden sm:inline text-muted-foreground/60 text-xs">
                          •
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground/70">
                          Scraped questions from LeetCode premium upto Nov 2025.
                        </span>
                      </div>
                      
                      {/* Right section - Links and CTA */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        {/* Social links */}
                        <div className="flex items-center gap-3 sm:gap-4">
                          <a
                            href="https://github.com/yogesiwan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all hover:bg-accent/50 active:bg-accent/70"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">GitHub</span>
                          </a>
                          <a
                            href="https://www.linkedin.com/in/yogesh-siwan-sde/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all hover:bg-accent/50 active:bg-accent/70"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <span className="hidden sm:inline">LinkedIn</span>
                          </a>
                          <a
                            href="mailto:yogesiwan@gmail.com"
                            className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all hover:bg-accent/50 active:bg-accent/70"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Email</span>
                          </a>
                        </div>
                        
                        {/* Buy me a coffee button */}
                        <a
                          href="https://www.buymeacoffee.com/yogeshsiwan"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-xl border border-amber-400/60 dark:border-amber-400/50 bg-gradient-to-r from-amber-400/20 via-amber-300/15 to-amber-200/20 dark:from-amber-400/15 dark:via-amber-300/10 dark:to-amber-200/15 px-4 py-2 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-100 shadow-[0_4px_12px_rgba(251,191,36,0.2)] dark:shadow-[0_4px_12px_rgba(251,191,36,0.15)] transition-all hover:from-amber-400/30 hover:via-amber-300/25 hover:to-amber-200/30 dark:hover:from-amber-400/20 dark:hover:via-amber-300/15 dark:hover:to-amber-200/20 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(251,191,36,0.3)] dark:hover:shadow-[0_6px_16px_rgba(251,191,36,0.2)] active:translate-y-0"
                        >
                          <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 text-amber-500 text-base shadow-inner shadow-amber-500/20 group-hover:bg-white group-hover:scale-110 transition-transform">
                            ☕
                          </span>
                          <span>Buy me a coffee</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

