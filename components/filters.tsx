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
    <div className="space-y-6 p-6 bg-card border border-border rounded-lg">
      <h2 className="text-2xl font-bold">Filters</h2>

      {/* Most Frequent Questions Toggle */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showMostFrequent || false}
            onChange={handleMostFrequentToggle}
            className="w-4 h-4 rounded border-border"
          />
          <span className="font-medium">Show Most Frequent Questions (across all companies)</span>
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
          <div className="space-y-2">
            <label className="block font-medium">Companies</label>
            <input
              type="text"
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full p-2 border border-border rounded bg-background text-sm"
            />
            <div className="max-h-48 overflow-y-auto border border-border rounded p-2 space-y-1">
              {filteredCompanies.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 text-center">No companies found</div>
              ) : (
                filteredCompanies.map(company => (
                  <label key={company.name} className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.companies.includes(company.name)}
                      onChange={() => handleCompanyToggle(company.name)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">{company.name}</span>
                  </label>
                ))
              )}
            </div>
            {filters.companies.length > 1 && (
              <div className="mt-2 space-y-2">
                <label className="block font-medium text-sm">Multi-Company Mode</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multiCompanyMode"
                      checked={filters.multiCompanyMode === 'union'}
                      onChange={() => handleMultiCompanyModeChange('union')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Union (All questions)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="multiCompanyMode"
                      checked={filters.multiCompanyMode === 'intersection'}
                      onChange={() => handleMultiCompanyModeChange('intersection')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Intersection (Common questions)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Time Period Selection */}
          <div className="space-y-2">
            <label className="block font-medium">Time Period</label>
            <select
              value={filters.timePeriod || 'all'}
              onChange={(e) => onFiltersChange({ ...filters, timePeriod: e.target.value })}
              className="w-full p-2 border border-border rounded bg-background"
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
      <div className="space-y-2">
        <label className="block font-medium">Difficulty</label>
        <div className="flex space-x-4">
          {['Easy', 'Medium', 'Hard'].map(difficulty => (
            <label key={difficulty} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.difficulties.includes(difficulty)}
                onChange={() => handleDifficultyToggle(difficulty)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">{difficulty}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frequency Range */}
      <div className="space-y-2">
        <label className="block font-medium">Frequency Range (%)</label>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-1">Min</label>
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
              className="w-full p-2 border border-border rounded bg-background"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-1">Max</label>
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
              className="w-full p-2 border border-border rounded bg-background"
              placeholder="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

