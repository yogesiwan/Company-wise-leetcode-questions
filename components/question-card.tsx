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
    <div className="p-4 border border-border rounded-lg hover:shadow-lg transition-shadow bg-card">
      <div className="flex items-start justify-between mb-3">
        <a
          href={question.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold hover:text-primary transition-colors flex-1 mr-2"
        >
          {question.title}
        </a>
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground">ID: {question.id}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">Acceptance: {question.acceptanceRate.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">Frequency: {question.frequency.toFixed(1)}%</span>
        {question.timePeriod && question.timePeriod !== 'all' && (
          <>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Period: {question.timePeriod.replace(/-/g, ' ')}</span>
          </>
        )}
      </div>

      {/* Company Tags */}
      {companiesToShow.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {companiesToShow.map((company, idx) => (
            <span
              key={`${company}-${idx}`}
              className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {company}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

