'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AuthButton } from './auth-button';
import { ThemeToggle } from './theme-toggle';
import { useToast } from './toast';

export function LandingPage() {
  const [mounted, setMounted] = React.useState(false);
  const [lastUpdatedDate, setLastUpdatedDate] = React.useState('Nov 2025');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.lastUpdatedDate) {
            setLastUpdatedDate(data.settings.lastUpdatedDate);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleStartPreparing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (status === 'loading') {
      e.preventDefault();
      return;
    }

    if (!session?.user) {
      e.preventDefault();
      addToast({
        message: 'Log in first.',
        type: 'info',
        duration: 2500,
      });
    }
    // If logged in, allow default Link navigation
  };

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Company-Specific Filtering',
      description: 'Filter LeetCode questions by specific companies.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Multi-Company Analysis',
      description: 'Compare questions across multiple companies. Use union mode to see all questions or intersection mode for common ones.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Most Frequent Questions',
      description: 'Discover the hottest questions across all companies.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Time Period Filtering',
      description: 'Filter by recency - last 30 days, 3 months, 6 months, or all time.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Difficulty & Frequency',
      description: 'Filter by difficulty level and frequency percentage.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: 'Personal Notes & Tracking',
      description: 'Save personal notes for each question and track your progress.',
    },
  ];

  const stats = [
    { label: 'Companies', value: '100+'},
    { label: 'Questions', value: '2000+'},
    { label: 'Updated', value: lastUpdatedDate},
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 dark:border-border/30 bg-gradient-to-b from-card/95 via-card/85 to-card/75 dark:from-card/90 dark:via-card/80 dark:to-card/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/60 dark:supports-[backdrop-filter]:bg-card/50 shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_-1px_20px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-12 w-12 flex items-center justify-center">
                <svg
                  className="w-14 h-14 text-black"
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24 22L16 32l8 10M40 22l8 10-8 10"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M33 20l-4 24"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                DeCodeIt
              </span>
            </Link>
          </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-20 md:pb-32">
        {/* Background gradient orbs - smaller on mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-48 h-48 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-48 h-48 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] sm:text-xs md:text-sm font-medium text-primary mb-4 sm:mb-6 md:mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-primary"></span>
              </span>
              <span className="whitespace-nowrap">Updated to {lastUpdatedDate}</span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-3 sm:mb-4 md:mb-6 leading-[1.1] sm:leading-[1.1] transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                Master Company-Specific
              </span>
              <span className="block bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mt-1 sm:mt-2">
                LeetCode Questions
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 leading-relaxed px-2 sm:px-0 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Filter, search, and track LeetCode questions by company, difficulty, and frequency. 
            </p>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/main"
                onClick={handleStartPreparing}
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base min-h-[44px] sm:min-h-[48px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 touch-manipulation w-full sm:w-auto"
              >
                <span>Start Preparing</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-2xl mx-auto px-2 sm:px-0 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-0.5 sm:mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2 sm:px-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-[1.1] sm:leading-[1.1]">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent block p-2">
                  Smart filtering, better practice
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-2 sm:mt-3">
                Narrow down questions by company, topic, difficulty, and more.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl border bg-gradient-to-br from-card/95 via-card/90 to-background/90 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 p-4 sm:p-5 md:p-6 lg:p-8 touch-manipulation"
                >
                  {/* Accent gradient */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <div className="w-5 h-5 sm:w-6 sm:h-6">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 sm:mb-2 text-foreground leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
    
    </div>
  );
}
