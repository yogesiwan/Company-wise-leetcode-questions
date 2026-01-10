'use client';

import * as React from 'react';
import { Filters } from '@/components/filters';
import { QuestionCard } from '@/components/question-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Pagination } from '@/components/pagination';
import { FilterOptions, LeetCodeQuestion } from '@/types';
import { useSession } from 'next-auth/react';
import { AuthButton } from '@/components/auth-button';

export default function AppPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = React.useState<Array<{ name: string; availablePeriods: string[] }>>([]);
  const [allQuestions, setAllQuestions] = React.useState<LeetCodeQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<FilterOptions>({
    companies: [],
    difficulties: [],
    showMostFrequent: false,
    multiCompanyMode: 'union',
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<LeetCodeQuestion[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [questionStates, setQuestionStates] = React.useState<
    Record<string, { done: boolean; note: string }>
  >({});
  const [lastUpdatedDate, setLastUpdatedDate] = React.useState('Nov 2025');

  // Load companies on mount
  React.useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setCompanies(data.companies);
        }
      })
      .catch(err => {
        setError('Failed to load companies');
        console.error(err);
      });
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

  // Fetch questions when filters change
  React.useEffect(() => {
    const fetchQuestions = async () => {
      // Don't fetch if no companies selected and not showing most frequent
      if (!filters.showMostFrequent && filters.companies.length === 0) {
        setAllQuestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch questions');
        }

        setAllQuestions(data.questions || []);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch questions');
        setAllQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [filters]);

  // Global search effect with debounce
  React.useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let isActive = true;
    setSearchError(null);
    const controller = new AbortController();
    const debounceTimer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await fetch(`/api/questions/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to search questions');
        }
        if (!isActive) return;
        setSearchResults(data.questions || []);
        setSearchError(null);
      } catch (err) {
        if (!isActive) return;
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setSearchResults([]);
        setSearchError(err instanceof Error ? err.message : 'Failed to search questions');
      } finally {
        if (!isActive) return;
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchQuery]);

  const trimmedSearchQuery = searchQuery.trim();
  const isSearchActive = trimmedSearchQuery.length >= 2;
  const activeQuestions = isSearchActive ? searchResults : allQuestions;
  const activeLoading = isSearchActive ? searchLoading : loading;
  const activeError = isSearchActive ? searchError : error;
  const defaultHeading = filters.showMostFrequent
    ? 'Most Frequent Questions'
    : filters.companies.length > 1
      ? `${filters.multiCompanyMode === 'intersection' ? 'Common' : 'All'} Questions (${filters.companies.length} companies)`
      : filters.companies.length === 1
        ? `Questions for ${filters.companies[0]}`
        : 'Select a company to view questions';
  const questionHeading = isSearchActive
    ? `Search results for "${trimmedSearchQuery}"`
    : defaultHeading;
  const questionCountLabel = isSearchActive
    ? `${activeQuestions.length} match${activeQuestions.length !== 1 ? 'es' : ''}`
    : `${activeQuestions.length} question${activeQuestions.length !== 1 ? 's' : ''}`;
  const emptyStateMessage = isSearchActive
    ? `No questions found for "${trimmedSearchQuery}"`
    : filters.showMostFrequent || filters.companies.length > 0
      ? 'No questions found matching your filters'
      : 'Please select at least one company or enable "Most Frequent Questions"';

  // Calculate pagination
  const totalPages = Math.ceil(activeQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = activeQuestions.slice(startIndex, endIndex);
  const showingFrom = activeQuestions.length > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, activeQuestions.length);

  // Reset to first page if current page is out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [isSearchActive]);

  // Load user question states for currently visible questions
  React.useEffect(() => {
    if (!session || paginatedQuestions.length === 0) {
      return;
    }

    const ids = paginatedQuestions.map((q) => q.id);
    const uniqueIds = Array.from(new Set(ids));

    let aborted = false;

    const loadStates = async () => {
      try {
        const params = new URLSearchParams({ ids: uniqueIds.join(',') });
        const res = await fetch(`/api/user-question-states?${params.toString()}`);
        if (!res.ok) {
          console.error('Failed to load user question states');
          return;
        }
        const data = await res.json();
        if (aborted) return;
        const nextStates: Record<string, { done: boolean; note: string }> = { ...questionStates };
        for (const state of data.states || []) {
          nextStates[state.questionId] = {
            done: !!state.done,
            note: state.note ?? '',
          };
        }
        setQuestionStates(nextStates);
      } catch (err) {
        if (!aborted) {
          console.error('Error fetching user question states', err);
        }
      }
    };

    loadStates();

    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, paginatedQuestions.map((q) => q.id).join(',')]);

  const handleToggleDone = async (questionId: string, nextDone: boolean) => {
    if (!session) return;
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        done: nextDone,
        note: prev[questionId]?.note ?? '',
      },
    }));

    try {
      const res = await fetch('/api/user-question-states', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, done: nextDone }),
      });
      if (!res.ok) {
        throw new Error('Failed to update state');
      }
    } catch (err) {
      console.error('Failed to update done state', err);
      // Optionally revert on error
    }
  };

  const handleUpdateNote = async (questionId: string, note: string) => {
    if (!session) return;
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        done: prev[questionId]?.done ?? false,
        note,
      },
    }));

    try {
      const res = await fetch('/api/user-question-states', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, note }),
      });
      if (!res.ok) {
        throw new Error('Failed to update note');
      }
    } catch (err) {
      console.error('Failed to update note', err);
      // keep optimistic UI; errors only logged
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 dark:border-border/30 bg-gradient-to-b from-card/95 via-card/85 to-card/75 dark:from-card/90 dark:via-card/80 dark:to-card/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/60 dark:supports-[backdrop-filter]:bg-card/50 shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_-1px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_-1px_20px_rgba(0,0,0,0.3)]">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center gap-3 relative">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary shadow-sm">
                Updated to {lastUpdatedDate}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
              Filter questions by company, difficulty, frequency and time period.
            </p>
          </div>
          <div className="order-3 w-full sm:order-2 sm:w-auto sm:min-w-[230px]">
            <label htmlFor="global-question-search" className="sr-only">
              Search questions globally
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </span>
              <input
                id="global-question-search"
                type="search"
                placeholder="Global search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-background/90 px-9 pr-11 py-2 text-sm shadow-inner shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
                  aria-label="Clear search"
                >
                  {searchLoading ? (
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground">
              {isSearchActive && !searchLoading && !searchError && (
                <>
                  <span className="text-primary font-medium">
                    {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
                  </span>
                  <span>Filters paused</span>
                </>
              )}
              {searchError && (
                <span className="text-destructive">{searchError}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto order-2 sm:order-3">
            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-secondary/80 hover:bg-accent/80 active:bg-accent/90 transition-colors relative backdrop-blur-xl border border-white/10 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-sm"
              aria-label="Toggle filters"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {((filters.companies.length > 0) || (filters.difficulties.length > 0) || filters.showMostFrequent) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center shadow-sm">
                  {(filters.companies.length || 0) + (filters.difficulties.length || 0) + (filters.showMostFrequent ? 1 : 0)}
                </span>
              )}
            </button>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:items-start">
          {/* Filters Sidebar - Mobile: Overlay, Desktop: Sticky Sidebar */}
          <div className={`lg:col-span-1 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            {/* Mobile Overlay Background */}
            {filtersOpen && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                onClick={() => setFiltersOpen(false)}
                aria-hidden="true"
              />
            )}
            
            {/* Mobile Filters Panel - Fixed full height slide-in */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-96 max-w-[85vw] bg-card/95 backdrop-blur-2xl border-r border-white/15 dark:border-white/10 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
              filtersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {/* Mobile Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-2xl border-b border-white/15 dark:border-white/10 p-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold">Filters</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Mobile Scrollable Content */}
              <div className="h-[calc(100vh-60px)] overflow-y-auto overscroll-contain pb-8">
                <Filters
                  companies={companies}
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    setFilters(newFilters);
                    // Close filters on mobile after selection
                    if (window.innerWidth < 1024) {
                      setFiltersOpen(false);
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Desktop Filters Panel - Sticky sidebar with internal scroll */}
            <div className="hidden lg:block sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <Filters
                companies={companies}
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                }}
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-3">
            {/* Selected Companies Tags at Top */}
            {!filters.showMostFrequent && filters.companies.length > 0 && (
              <div className="mb-4 p-3 sm:p-4 bg-card/80 backdrop-blur-2xl border border-white/15 dark:border-white/10 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Selected:</span>
                  {filters.companies.map(companyName => (
                    <span
                      key={companyName}
                      className="group relative px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 hover:bg-primary/20 active:bg-primary/30 transition-colors touch-manipulation"
                    >
                      <span className="truncate max-w-[120px] sm:max-w-none">{companyName}</span>
                      <button
                        onClick={() => {
                          const newCompanies = filters.companies.filter(c => c !== companyName);
                          setFilters({ ...filters, companies: newCompanies });
                        }}
                        className="opacity-70 group-hover:opacity-100 group-active:opacity-100 transition-opacity hover:bg-primary/30 active:bg-primary/40 rounded-full p-1 -mr-1 min-w-[20px] min-h-[20px] flex items-center justify-center touch-manipulation"
                        aria-label={`Remove ${companyName}`}
                        title={`Remove ${companyName}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-semibold break-words">
                {questionHeading}
              </h2>
              {!activeLoading && activeQuestions.length > 0 && (
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {questionCountLabel}
                </span>
              )}
            </div>

            {activeError && (
              <div className="p-4 mb-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
                {activeError}
              </div>
            )}

            {activeLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {!activeLoading && !activeError && activeQuestions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {emptyStateMessage}
              </div>
            )}

            {!activeLoading && !activeError && activeQuestions.length > 0 && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  {paginatedQuestions.map((question, index) => (
                    <QuestionCard
                      key={`${question.id}-${startIndex + index}`}
                      question={question}
                      isAuthenticated={!!session}
                      done={questionStates[question.id]?.done ?? false}
                      note={questionStates[question.id]?.note ?? ''}
                      onToggleDone={(done) => handleToggleDone(question.id, done)}
                      onChangeNote={(note) => handleUpdateNote(question.id, note)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(items) => {
                    setItemsPerPage(items);
                    setCurrentPage(1);
                  }}
                  totalItems={activeQuestions.length}
                  showingFrom={showingFrom}
                  showingTo={showingTo}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

