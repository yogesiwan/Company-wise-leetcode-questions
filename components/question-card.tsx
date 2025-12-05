'use client';

import { LeetCodeQuestion } from '@/types';
import * as React from 'react';

interface QuestionCardProps {
  question: LeetCodeQuestion;
  isAuthenticated?: boolean;
  done?: boolean;
  note?: string;
  onToggleDone?: (done: boolean) => void;
  onChangeNote?: (note: string) => void;
}

export function QuestionCard({
  question,
  isAuthenticated,
  done = false,
  note = '',
  onToggleDone,
  onChangeNote,
}: QuestionCardProps) {

  const getDifficultyHoverBorder = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'hover:border-green-500/60 hover:ring-1 hover:ring-green-500/40';
      case 'Medium':
        return 'hover:border-yellow-500/60 hover:ring-1 hover:ring-yellow-500/40';
      case 'Hard':
        return 'hover:border-red-500/60 hover:ring-1 hover:ring-red-500/40';
      default:
        return 'hover:border-gray-500/60 hover:ring-1 hover:ring-gray-500/40';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'Hard':
        return 'bg-red-500/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  // Get companies to display as tags
  const companiesToShow = question.companyTags || (question.company ? [question.company] : []);

  const [localNote, setLocalNote] = React.useState(note);
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);

  React.useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const commitNote = () => {
    if (onChangeNote && localNote !== note) {
      onChangeNote(localNote);
    }
  };

  const closeNote = () => {
    commitNote();
    setIsNoteOpen(false);
  };

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card/95 via-card/90 to-background/90 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-0.5 ${getDifficultyHoverBorder(question.difficulty)}`}  
      >
        {/* Accent strip for quick scanning */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-1 sm:w-1.5 bg-gradient-to-b opacity-90 ${question.difficulty === 'Hard'
                ? 'from-red-400/80 via-red-500/70 to-orange-400/70'
                : question.difficulty === 'Medium'
                  ? 'from-yellow-400/80 via-amber-400/70 to-orange-400/70'
                  : 'from-emerald-400/80 via-emerald-500/70 to-teal-400/70'
            }`}
        />

        <div className="relative p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg font-semibold tracking-tight hover:text-primary active:text-primary/80 transition-colors flex-1 min-w-0 break-words touch-manipulation"
            >
              {question.title}
            </a>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => onToggleDone && onToggleDone(!done)}
                className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] 'bg-card/80 border-border/70 text-muted-foreground hover:text-foreground'
                  }`}
                aria-label={done ? 'Mark as not done' : 'Mark as done'}
              >
                {done ? (
                  // Checked square
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={2}>
                    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth={2} />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12.5l3 3 5-6"
                    />
                  </svg>
                ) : (
                  // Empty square
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="2" ry="2" strokeWidth={2} />
                  </svg>
                )}
              </button>
            )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsNoteOpen(true)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card/95 transition"
                    aria-label="Open personal note"
                  >
                    {/* Pencil icon for notes */}
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.653 2.652L10.5 16.153 7 17l.847-3.5 9.015-9.013z"
                      />
                    </svg>
                  </button>
                </>
              )}
              <span
                className={`px-2.5 sm:px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap shadow-sm ${getDifficultyColor(
                  question.difficulty,
                )}`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[11px] sm:text-xs text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground/90">
              ID: {question.id}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Acceptance: {question.acceptanceRate.toFixed(1)}%
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Frequency: {question.frequency.toFixed(1)}%
            </span>
            {question.timePeriod && question.timePeriod !== 'all' && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>
                  Period: {question.timePeriod.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          {/* Company Tags / Logos */}
          {companiesToShow.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground/80">
                  Companies
                </span>
                {/* Collapsed summary with deck-style capsules aligned to the right */}
                <button
                  type="button"
                  onClick={() => setShowAllCompanies((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] sm:text-[11px] font-medium text-primary hover:bg-primary/10 hover:border-primary/50 transition-all touch-manipulation"
                  aria-expanded={showAllCompanies}
                >
                  <div className="flex -space-x-1">
                    {companiesToShow.slice(0, 3).map((company, idx) => (
                      <span
                        key={`${company}-pill-${idx}`}
                        title={company}
                        className="inline-flex items-center rounded-full border border-primary/25 bg-white px-2 py-0.5 text-[10px] font-medium text-primary shadow-sm dark:bg-gray-300 dark:text-black"
                      >
                        <span className="max-w-[70px] truncate">{company}</span>
                      </span>
                    ))}
                    {companiesToShow.length > 3 && (
                      <span className="inline-flex items-center justify-center rounded-full border border-primary/25 bg-white px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm dark:bg-gray-300 dark:text-black">
                        +{companiesToShow.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap">See all</span>
                </button>
              </div>

              {/* Expanded list with smooth animation */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${showAllCompanies ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-1">
                  {companiesToShow.map((company, idx) => (
                    <span
                      key={`${company}-${idx}`}
                      title={company}
                      className="inline-flex items-center rounded-full border border-primary/25 bg-white px-2.5 py-1 text-[11px] sm:text-xs font-medium text-primary shadow-sm dark:bg-gray-300 dark:text-black"
                    >
                      <span className="truncate max-w-[160px]">{company}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && isNoteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-3 sm:px-6"
          onClick={closeNote}
        >
          <div
            className="w-full max-w-2xl md:max-w-3xl rounded-2xl border border-border/70 bg-card/95 shadow-2xl p-4 sm:p-6 md:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                  Personal note
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                  {question.title}
                </p>
              </div>
              <button
                type="button"
                onClick={closeNote}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card/95 transition"
                aria-label="Close note"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <label className="sr-only" htmlFor={`note-${question.id}`}>
              Personal note for {question.title}
            </label>
            <textarea
              id={`note-${question.id}`}
              rows={18}
              value={localNote}
              onChange={(e) => setLocalNote(e.target.value)}
              className="w-full rounded-xl border border-border/70 bg-background/95 px-1 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 resize-none shadow-inner shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              placeholder="Write your personal notes, patterns, mistakes to avoid, or links here..."
            />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Notes are saved per question and per user, shared across all companies where this
              question appears.
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setLocalNote(note);
                  setIsNoteOpen(false);
                }}
                className="inline-flex items-center rounded-full border border-border/70 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-card/90 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  commitNote();
                  setIsNoteOpen(false);
                }}
                className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground shadow hover:bg-primary/90 transition"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

