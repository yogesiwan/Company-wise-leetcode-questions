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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">LeetCode Prep</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Filters
              companies={companies}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Questions List */}
          <div className="lg:col-span-3">
            {/* Selected Companies Tags at Top */}
            {!filters.showMostFrequent && filters.companies.length > 0 && (
              <div className="mb-4 p-4 bg-card border border-border rounded-lg">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Selected:</span>
                  {filters.companies.map(companyName => (
                    <span
                      key={companyName}
                      className="group relative px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                    >
                      {companyName}
                      <button
                        onClick={() => {
                          const newCompanies = filters.companies.filter(c => c !== companyName);
                          setFilters({ ...filters, companies: newCompanies });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/30 rounded-full p-0.5 -mr-1"
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

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {filters.showMostFrequent
                  ? 'Most Frequent Questions'
                  : filters.companies.length > 1
                  ? `${filters.multiCompanyMode === 'intersection' ? 'Common' : 'All'} Questions (${filters.companies.length} companies)`
                  : filters.companies.length === 1
                  ? `Questions for ${filters.companies[0]}`
                  : 'Select a company to view questions'}
              </h2>
              {!loading && allQuestions.length > 0 && (
                <span className="text-sm text-muted-foreground">
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
                <div className="space-y-4">
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

