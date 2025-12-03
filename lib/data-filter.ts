import { LeetCodeQuestion, CompanyData, FilterOptions } from '@/types';
import { loadMultipleCompaniesData, getMostFrequentQuestions } from './data-parser';

/**
 * Filter questions by difficulty
 */
function filterByDifficulty(questions: LeetCodeQuestion[], difficulties: string[]): LeetCodeQuestion[] {
  if (difficulties.length === 0) return questions;
  return questions.filter(q => difficulties.includes(q.difficulty));
}

/**
 * Filter questions by frequency range
 */
function filterByFrequency(
  questions: LeetCodeQuestion[],
  minFrequency?: number,
  maxFrequency?: number
): LeetCodeQuestion[] {
  return questions.filter(q => {
    if (minFrequency !== undefined && q.frequency < minFrequency) return false;
    if (maxFrequency !== undefined && q.frequency > maxFrequency) return false;
    return true;
  });
}

/**
 * Filter questions by time period
 */
function filterByTimePeriod(questions: LeetCodeQuestion[], timePeriod?: string): LeetCodeQuestion[] {
  if (!timePeriod || timePeriod === 'all') return questions;
  return questions.filter(q => q.timePeriod === timePeriod);
}

/**
 * Get union of questions from multiple companies (all unique questions)
 */
function getUnionQuestions(companyDataList: CompanyData[]): LeetCodeQuestion[] {
  const questionMap = new Map<string, LeetCodeQuestion>();
  
  for (const companyData of companyDataList) {
    for (const question of companyData.questions) {
      const key = question.id;
      // Keep the question with highest frequency if duplicate
      if (!questionMap.has(key) || questionMap.get(key)!.frequency < question.frequency) {
        questionMap.set(key, { ...question, company: companyData.name });
      }
    }
  }
  
  return Array.from(questionMap.values());
}

/**
 * Get intersection of questions from multiple companies (common questions)
 */
function getIntersectionQuestions(companyDataList: CompanyData[]): LeetCodeQuestion[] {
  if (companyDataList.length === 0) return [];
  if (companyDataList.length === 1) return companyDataList[0].questions;

  // Start with questions from first company
  const firstCompanyQuestions = new Map(
    companyDataList[0].questions.map(q => [q.id, q])
  );

  // Find questions that exist in all companies
  const commonQuestions = new Map<string, LeetCodeQuestion>();
  
  for (const [id, question] of firstCompanyQuestions.entries()) {
    let existsInAll = true;
    let maxFrequency = question.frequency;
    const companies: string[] = [companyDataList[0].name];

    for (let i = 1; i < companyDataList.length; i++) {
      const found = companyDataList[i].questions.find(q => q.id === id);
      if (!found) {
        existsInAll = false;
        break;
      }
      maxFrequency = Math.max(maxFrequency, found.frequency);
      companies.push(companyDataList[i].name);
    }

    if (existsInAll) {
      commonQuestions.set(id, {
        ...question,
        frequency: maxFrequency,
        company: companies.join(', '), // Show all companies
      });
    }
  }

  return Array.from(commonQuestions.values());
}

/**
 * Apply all filters to questions
 */
export function filterQuestions(
  questions: LeetCodeQuestion[],
  options: FilterOptions
): LeetCodeQuestion[] {
  let filtered = [...questions];

  // Filter by difficulty
  if (options.difficulties && options.difficulties.length > 0) {
    filtered = filterByDifficulty(filtered, options.difficulties);
  }

  // Filter by frequency
  filtered = filterByFrequency(
    filtered,
    options.minFrequency,
    options.maxFrequency
  );

  // Filter by time period
  if (options.timePeriod) {
    filtered = filterByTimePeriod(filtered, options.timePeriod);
  }

  return filtered;
}

/**
 * Get filtered questions based on filter options
 */
export function getFilteredQuestions(options: FilterOptions): {
  questions: LeetCodeQuestion[];
  totalCount: number;
} {
  // Handle most frequent questions
  if (options.showMostFrequent) {
    const mostFrequent = getMostFrequentQuestions(2);
    const filtered = filterQuestions(mostFrequent, options);
    return {
      questions: filtered,
      totalCount: filtered.length,
    };
  }

  // Handle company filtering
  if (options.companies.length === 0) {
    return { questions: [], totalCount: 0 };
  }

  // CRITICAL: Pass timePeriod to loadCompanyData to prevent duplicates
  // When timePeriod is 'all', it will only load from all.csv
  const companyDataList = loadMultipleCompaniesData(options.companies, options.timePeriod);
  
  let questions: LeetCodeQuestion[];
  
  if (options.companies.length === 1) {
    // Single company
    questions = companyDataList[0].questions;
  } else {
    // Multiple companies - union or intersection
    if (options.multiCompanyMode === 'intersection') {
      questions = getIntersectionQuestions(companyDataList);
    } else {
      // Default to union
      questions = getUnionQuestions(companyDataList);
    }
  }

  // Apply additional filters (but skip timePeriod filter since we already filtered at load time)
  const tempOptions = { ...options };
  delete tempOptions.timePeriod;
  const filtered = filterQuestions(questions, tempOptions);
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return a.title.localeCompare(b.title);
  });

  return {
    questions: sortedFiltered,
    totalCount: sortedFiltered.length,
  };
}

/**
 * Validate filter options for data consistency
 */
export function validateFilterOptions(options: FilterOptions): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate difficulties
  const validDifficulties = ['Easy', 'Medium', 'Hard'];
  for (const diff of options.difficulties) {
    if (!validDifficulties.includes(diff)) {
      errors.push(`Invalid difficulty: ${diff}`);
    }
  }

  // Validate frequency range
  if (options.minFrequency !== undefined && options.minFrequency < 0) {
    errors.push('Minimum frequency cannot be negative');
  }
  if (options.maxFrequency !== undefined && options.maxFrequency > 100) {
    errors.push('Maximum frequency cannot exceed 100');
  }
  if (
    options.minFrequency !== undefined &&
    options.maxFrequency !== undefined &&
    options.minFrequency > options.maxFrequency
  ) {
    errors.push('Minimum frequency cannot be greater than maximum frequency');
  }

  // Validate time period
  const validPeriods = ['all', 'six-months', 'three-months', 'more-than-six-months', 'thirty-days'];
  if (options.timePeriod && !validPeriods.includes(options.timePeriod)) {
    errors.push(`Invalid time period: ${options.timePeriod}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

