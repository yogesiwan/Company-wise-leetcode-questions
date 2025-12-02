'use client';

import * as React from 'react';
import { Filters } from '@/components/filters';
import { QuestionCard } from '@/components/question-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Pagination } from '@/components/pagination';
import { FilterOptions, LeetCodeQuestion } from '@/types';

export default function Home() {
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

  // Calculate pagination
  const totalPages = Math.ceil(allQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = allQuestions.slice(startIndex, endIndex);
  const showingFrom = allQuestions.length > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, allQuestions.length);

  // Reset to first page if current page is out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold truncate">Upto Nov 2025</h1>
          <div className="flex items-center gap-2">
            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden p-2 rounded-lg bg-secondary hover:bg-accent transition-colors relative"
              aria-label="Toggle filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {((filters.companies.length > 0) || (filters.difficulties.length > 0) || filters.showMostFrequent) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                  {(filters.companies.length || 0) + (filters.difficulties.length || 0) + (filters.showMostFrequent ? 1 : 0)}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Filters Sidebar - Mobile: Overlay, Desktop: Sidebar */}
          <div className={`lg:col-span-1 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            {/* Mobile Overlay */}
            {filtersOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setFiltersOpen(false)}
                aria-hidden="true"
              />
            )}
            {/* Filters Panel */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-80 sm:w-96 lg:w-full max-w-full bg-card border-r lg:border-r-0 lg:border border-border overflow-y-auto transform transition-transform duration-300 ease-in-out ${
              filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between lg:hidden">
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

          {/* Questions List */}
          <div className="lg:col-span-3">
            {/* Selected Companies Tags at Top */}
            {!filters.showMostFrequent && filters.companies.length > 0 && (
              <div className="mb-4 p-3 sm:p-4 bg-card border border-border rounded-lg">
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
                {filters.showMostFrequent
                  ? 'Most Frequent Questions'
                  : filters.companies.length > 1
                  ? `${filters.multiCompanyMode === 'intersection' ? 'Common' : 'All'} Questions (${filters.companies.length} companies)`
                  : filters.companies.length === 1
                  ? `Questions for ${filters.companies[0]}`
                  : 'Select a company to view questions'}
              </h2>
              {!loading && allQuestions.length > 0 && (
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {allQuestions.length} question{allQuestions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {error && (
              <div className="p-4 mb-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {!loading && !error && allQuestions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {filters.showMostFrequent || filters.companies.length > 0
                  ? 'No questions found matching your filters'
                  : 'Please select at least one company or enable "Most Frequent Questions"'}
              </div>
            )}

            {!loading && !error && allQuestions.length > 0 && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  {paginatedQuestions.map((question, index) => (
                    <QuestionCard key={`${question.id}-${startIndex + index}`} question={question} />
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
                  totalItems={allQuestions.length}
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

