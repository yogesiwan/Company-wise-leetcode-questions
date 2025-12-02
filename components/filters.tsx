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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-card/75 backdrop-blur-2xl border border-white/15 dark:border-white/10 rounded-2xl shadow-xl lg:block">
      <div className="hidden lg:flex items-baseline justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Filters</h2>
        {/* <p className="text-xs text-muted-foreground">
          Refine companies, time periods and difficulty.
        </p> */}
      </div>

      {/* Most Frequent Questions Toggle */}
      <div className="space-y-2 pt-1 border-t border-border/60">
        <label className="flex items-start sm:items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1">
          <input
            type="checkbox"
            checked={filters.showMostFrequent || false}
            onChange={handleMostFrequentToggle}
            className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 rounded border-border flex-shrink-0"
          />
          <span className="text-sm sm:text-base font-medium leading-relaxed">Show Most Frequent Questions (across all companies)</span>
        </label>
      </div>

      {!filters.showMostFrequent && (
        <>
          {/* Selected Companies Tags */}
          {filters.companies.length > 0 && (
            <div className="space-y-2">
              <label className="block font-medium text-sm">Selected Companies ({filters.companies.length})</label>
              <div className="flex flex-wrap gap-2">
                {filters.companies.map(companyName => (
                  <span
                    key={companyName}
                    className="group relative px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
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
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="block text-sm sm:text-base font-medium">Companies</label>
            <input
              type="text"
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full p-2.5 sm:p-2 border border-border rounded bg-background text-sm sm:text-base touch-manipulation"
            />
            <div className="max-h-64 sm:max-h-48 overflow-y-auto border border-border rounded p-2 space-y-1">
              {filteredCompanies.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">No companies found</div>
              ) : (
                filteredCompanies.map(company => (
                  <label key={company.name} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:bg-accent active:bg-accent/80 p-2 sm:p-1 rounded touch-manipulation">
                    <input
                      type="checkbox"
                      checked={filters.companies.includes(company.name)}
                      onChange={() => handleCompanyToggle(company.name)}
                      className="w-5 h-5 sm:w-4 sm:h-4 rounded border-border flex-shrink-0"
                    />
                    <span className="text-sm sm:text-base">{company.name}</span>
                  </label>
                ))
              )}
            </div>
            {filters.companies.length > 1 && (
              <div className="mt-2 space-y-2">
                <label className="block font-medium text-xs sm:text-sm">Multi-Company Mode</label>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1">
                    <input
                      type="radio"
                      name="multiCompanyMode"
                      checked={filters.multiCompanyMode === 'union'}
                      onChange={() => handleMultiCompanyModeChange('union')}
                      className="w-5 h-5 sm:w-4 sm:h-4"
                    />
                    <span className="text-sm sm:text-base">Union (All questions)</span>
                  </label>
                  <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1">
                    <input
                      type="radio"
                      name="multiCompanyMode"
                      checked={filters.multiCompanyMode === 'intersection'}
                      onChange={() => handleMultiCompanyModeChange('intersection')}
                      className="w-5 h-5 sm:w-4 sm:h-4"
                    />
                    <span className="text-sm sm:text-base">Intersection (Common questions)</span>
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
              className="w-full p-2.5 sm:p-2 border border-border rounded bg-background text-sm sm:text-base touch-manipulation"
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
      <div className="space-y-2 pt-1 border-t border-border/60">
        <label className="block text-sm sm:text-base font-medium">Difficulty</label>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {['Easy', 'Medium', 'Hard'].map(difficulty => (
            <label key={difficulty} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer touch-manipulation py-1">
              <input
                type="checkbox"
                checked={filters.difficulties.includes(difficulty)}
                onChange={() => handleDifficultyToggle(difficulty)}
                className="w-5 h-5 sm:w-4 sm:h-4 rounded border-border flex-shrink-0"
              />
              <span className="text-sm sm:text-base">{difficulty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frequency Range */}
      <div className="space-y-2">
        <label className="block text-sm sm:text-base font-medium">Frequency Range (%)</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-1">Min</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={filters.minFrequency || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                minFrequency: e.target.value ? parseFloat(e.target.value) : undefined,
              })}
              className="w-full p-2.5 sm:p-2 border border-border rounded bg-background text-sm sm:text-base touch-manipulation"
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
              value={filters.maxFrequency || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxFrequency: e.target.value ? parseFloat(e.target.value) : undefined,
              })}
              className="w-full p-2.5 sm:p-2 border border-border rounded bg-background text-sm sm:text-base touch-manipulation"
              placeholder="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

