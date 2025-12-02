'use client';

import { LeetCodeQuestion } from '@/types';

interface QuestionCardProps {
  question: LeetCodeQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
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

  return (
    <div className="group p-3 sm:p-4 border border-white/15 dark:border-white/10 rounded-2xl bg-card/70 backdrop-blur-xl hover:bg-card/80 transition-all duration-150 hover:shadow-xl active:shadow-md hover:-translate-y">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
        <a
          href={question.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base sm:text-lg font-semibold tracking-tight hover:text-primary active:text-primary/80 transition-colors flex-1 break-words touch-manipulation"
        >
          {question.title}
        </a>
        <span className={`px-2.5 sm:px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 shadow-sm ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[11px] sm:text-xs">
        <span className="px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/90">
          ID: {question.id}
        </span>
        <span className="text-muted-foreground hidden sm:inline">•</span>
        <span className="text-muted-foreground">Acceptance: {question.acceptanceRate.toFixed(1)}%</span>
        <span className="text-muted-foreground hidden sm:inline">•</span>
        <span className="text-muted-foreground">Frequency: {question.frequency.toFixed(1)}%</span>
        {question.timePeriod && question.timePeriod !== 'all' && (
          <>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-muted-foreground">Period: {question.timePeriod.replace(/-/g, ' ')}</span>
          </>
        )}
      </div>

      {/* Company Tags */}
      {companiesToShow.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
          {companiesToShow.map((company, idx) => (
            <span
              key={`${company}-${idx}`}
              className="px-2 sm:px-2.5 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {company}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

