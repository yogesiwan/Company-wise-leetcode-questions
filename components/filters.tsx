'use client';

import * as React from 'react';
import { FilterOptions } from '@/types';

interface FiltersProps {
  companies: Array<{ name: string; availablePeriods: string[] }>;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function Filters({ companies, filters, onFiltersChange }: FiltersProps) {
  const [companySearch, setCompanySearch] = React.useState('');
  const [minFrequencyInput, setMinFrequencyInput] = React.useState(
    filters.minFrequency !== undefined ? String(filters.minFrequency) : ''
  );
  const [maxFrequencyInput, setMaxFrequencyInput] = React.useState(
    filters.maxFrequency !== undefined ? String(filters.maxFrequency) : ''
  );

  React.useEffect(() => {
    setMinFrequencyInput(filters.minFrequency !== undefined ? String(filters.minFrequency) : '');
  }, [filters.minFrequency]);

  React.useEffect(() => {
    setMaxFrequencyInput(filters.maxFrequency !== undefined ? String(filters.maxFrequency) : '');
  }, [filters.maxFrequency]);

  const commitFrequencyValue = (type: 'min' | 'max') => {
    const value = type === 'min' ? minFrequencyInput : maxFrequencyInput;
    const parsed = value.trim() === '' ? undefined : parseFloat(value);
    if (Number.isNaN(parsed)) {
      return;
    }

    const key = type === 'min' ? 'minFrequency' : 'maxFrequency';
    const currentValue = filters[key];
    if (parsed === currentValue) {
      return;
    }

    onFiltersChange({ ...filters, [key]: parsed } as FilterOptions);
  };

  const handleCompanyToggle = (companyName: string) => {
    const newCompanies = filters.companies.includes(companyName)
      ? filters.companies.filter(c => c !== companyName)
      : [...filters.companies, companyName];

    onFiltersChange({ ...filters, companies: newCompanies });
  };

  const handleRemoveCompany = (companyName: string) => {
    const newCompanies = filters.companies.filter(c => c !== companyName);
    onFiltersChange({ ...filters, companies: newCompanies });
  };

  const handleDifficultyToggle = (difficulty: string) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];

    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  const handleMostFrequentToggle = () => {
    onFiltersChange({ ...filters, showMostFrequent: !filters.showMostFrequent });
  };

  const handleMultiCompanyModeChange = (mode: 'union' | 'intersection') => {
    onFiltersChange({ ...filters, multiCompanyMode: mode });
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 border border-4 border-gray-200 dark:border-gray-800 sm:space-y-8 p-5 sm:p-7 bg-white/10 dark:bg-black/20 rounded-3xl">
      <div className="hidden flex flex-col lg:flex items-baseline justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground/95">
          Filters
        </h2>
        <p className="text-xs text-muted-foreground/80">
          Refine companies, time period, difficulty and frequency.
        </p>
      </div>

      {/* Most Frequent Questions Toggle */}
      <div className="space-y-2 pt-1 border-t border-border/50">
        <label className="flex items-start sm:items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1">
          <input
            type="checkbox"
            checked={filters.showMostFrequent || false}
            onChange={handleMostFrequentToggle}
            className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 rounded border-border flex-shrink-0 accent-primary"
          />
          <span className="text-sm sm:text-base font-medium leading-relaxed text-foreground/85">
            Show Most Frequent Questions
            <span className="block text-[11px] sm:text-xs font-normal text-muted-foreground">
              Ignores company selection and surfaces global hot questions.
            </span>
          </span>
        </label>
      </div>

      {!filters.showMostFrequent && (
        <>
          {/* Selected Companies Tags */}
          {filters.companies.length > 0 && (
            <div className="space-y-2">
              <label className="block font-medium text-xs sm:text-sm text-muted-foreground/90">
                Selected Companies
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary align-middle">
                  {filters.companies.length}
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {filters.companies.map(companyName => (
                  <span
                    key={companyName}
                    className="group relative px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/25 flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                  >
                    {companyName}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCompany(companyName);
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

          {/* Company Selection with Search */}
          <div className="space-y-2 pt-1 border-t border-border/50">
            <label className="block text-sm sm:text-base font-medium text-foreground/90">
              Companies
            </label>
            <input
              type="text"
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full p-2.5 sm:p-3 border border-border/60 rounded-xl bg-background/60 text-sm sm:text-base touch-manipulation focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/60"
            />
            <div className="max-h-64 sm:max-h-56 overflow-y-auto border border-border/60 rounded-xl p-1.5 space-y-0.5 bg-background/40">
              {filteredCompanies.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">No companies found</div>
              ) : (
                filteredCompanies.map(company => (
                  <label
                    key={company.name}
                    className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-accent/70 active:bg-accent/90 p-2 sm:p-1.5 rounded-xl touch-manipulation transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.companies.includes(company.name)}
                      onChange={() => handleCompanyToggle(company.name)}
                      className="w-5 h-5 sm:w-4 sm:h-4 rounded border-border flex-shrink-0 accent-primary"
                    />
                    <span className="text-sm sm:text-base truncate">{company.name}</span>
                  </label>
                ))
              )}
            </div>
            {filters.companies.length > 1 && (
              <div className="mt-2 space-y-2">
                <label className="block font-medium text-xs sm:text-sm text-muted-foreground/90">
                  Multi-Company Mode
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1 rounded-full px-2 sm:px-3 border border-transparent hover:border-border/70 transition-colors">
                    <input
                      type="radio"
                      name="multiCompanyMode"
                      checked={filters.multiCompanyMode === 'union'}
                      onChange={() => handleMultiCompanyModeChange('union')}
                      className="w-5 h-5 sm:w-4 sm:h-4 accent-primary"
                    />
                    <span className="text-sm sm:text-base">
                      Union
                      <span className="ml-1 text-[11px] text-muted-foreground">
                        All questions across selected companies
                      </span>
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1 rounded-full px-2 sm:px-3 border border-transparent hover:border-border/70 transition-colors">
                    <input
                      type="radio"
                      name="multiCompanyMode"
                      checked={filters.multiCompanyMode === 'intersection'}
                      onChange={() => handleMultiCompanyModeChange('intersection')}
                      className="w-5 h-5 sm:w-4 sm:h-4 accent-primary"
                    />
                    <span className="text-sm sm:text-base">
                      Intersection
                      <span className="ml-1 text-[11px] text-muted-foreground">
                        Only questions common to all selected companies
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Time Period Selection */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium">Time Period</label>
            <select
              value={filters.timePeriod || 'all'}
              onChange={(e) => onFiltersChange({ ...filters, timePeriod: e.target.value })}
              className="w-full p-2.5 sm:p-3 border border-border/60 rounded-xl bg-background/50 text-sm sm:text-base touch-manipulation focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all outline-none"
            >
              <option value="all">All Time</option>
              <option value="six-months">Last 6 Months</option>
              <option value="three-months">Last 3 Months</option>
              <option value="thirty-days">Last 30 Days</option>
              <option value="more-than-six-months">More than 6 Months</option>
            </select>
          </div>
        </>
      )}

      {/* Difficulty Selection */}
      <div className="space-y-2 pt-1 border-t border-border/50">
        <label className="block text-sm sm:text-base font-medium text-foreground/90">
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          {['Easy', 'Medium', 'Hard'].map(difficulty => {
            const active = filters.difficulties.includes(difficulty);
            const color =
              difficulty === 'Easy'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40'
                : difficulty === 'Medium'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/40'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/40';
            return (
              <button
                key={difficulty}
                type="button"
                onClick={() => handleDifficultyToggle(difficulty)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm border transition-all touch-manipulation ${
                  active
                    ? `${color} shadow-sm`
                    : 'border-border/60 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span>{difficulty}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Frequency Range */}
      <div className="space-y-2">
        <label className="block text-sm sm:text-base font-medium text-foreground/90">
          Frequency Range (%)
        </label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-1">Min</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={minFrequencyInput}
              onChange={(e) => setMinFrequencyInput(e.target.value)}
              onBlur={() => commitFrequencyValue('min')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitFrequencyValue('min');
                }
              }}
              className="w-full p-2.5 sm:p-3 border border-border/60 rounded-xl bg-background/60 text-sm sm:text-base touch-manipulation focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/60"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-1">Max</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={maxFrequencyInput}
              onChange={(e) => setMaxFrequencyInput(e.target.value)}
              onBlur={() => commitFrequencyValue('max')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitFrequencyValue('max');
                }
              }}
              className="w-full p-2.5 sm:p-3 border border-border/60 rounded-xl bg-background/60 text-sm sm:text-base touch-manipulation focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/60"
              placeholder="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}