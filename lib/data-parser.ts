import { LeetCodeQuestion, CompanyData } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Parse a CSV line properly handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());
  return result;
}

/**
 * Parse a CSV line and return a LeetCodeQuestion object
 */
function parseCSVLineToQuestion(line: string, company: string, timePeriod: string): LeetCodeQuestion | null {
  const parts = parseCSVLine(line);
  if (parts.length < 6) return null;

  const id = parts[0].trim();
  const url = parts[1].trim();
  const title = parts[2].trim();
  const difficulty = parts[3].trim() as 'Easy' | 'Medium' | 'Hard';
  const acceptanceRateStr = parts[4].trim().replace('%', '');
  const frequencyStr = parts[5].trim().replace('%', '');

  // Validate data
  if (!id || !url || !title || !difficulty || !acceptanceRateStr || !frequencyStr) {
    return null;
  }

  const acceptanceRate = parseFloat(acceptanceRateStr);
  const frequency = parseFloat(frequencyStr);

  // Validate numeric values
  if (isNaN(acceptanceRate) || isNaN(frequency)) {
    return null;
  }

  // Validate difficulty
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    return null;
  }

  // Validate ranges
  if (acceptanceRate < 0 || acceptanceRate > 100) {
    return null;
  }
  if (frequency < 0 || frequency > 100) {
    return null;
  }

  return {
    id,
    url,
    title,
    difficulty,
    acceptanceRate,
    frequency,
    company,
    timePeriod: timePeriod as any,
  };
}

/**
 * Read and parse a CSV file for a company
 */
function parseCompanyCSV(companyName: string, fileName: string): LeetCodeQuestion[] {
  const filePath = path.join(DATA_DIR, companyName, fileName);
  
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return []; // Need at least header + 1 data line

  const questions: LeetCodeQuestion[] = [];
  const timePeriod = fileName.replace('.csv', '');

  // Skip header line (index 0)
  for (let i = 1; i < lines.length; i++) {
    const question = parseCSVLineToQuestion(lines[i], companyName, timePeriod);
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Get all company names from the data directory
 */
export function getAllCompanies(): string[] {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

/**
 * Get all available time periods for a company
 */
export function getCompanyTimePeriods(companyName: string): string[] {
  const companyDir = path.join(DATA_DIR, companyName);
  if (!fs.existsSync(companyDir)) {
    return [];
  }

  const files = fs.readdirSync(companyDir);
  return files
    .filter(file => file.endsWith('.csv'))
    .map(file => file.replace('.csv', ''))
    .sort();
}

/**
 * Load data for a specific company with optional time period filter
 * CRITICAL: When timePeriod is 'all', only load from all.csv to avoid duplicates
 */
export function loadCompanyData(companyName: string, timePeriod?: string): CompanyData {
  const companyDir = path.join(DATA_DIR, companyName);
  if (!fs.existsSync(companyDir)) {
    return {
      name: companyName,
      questions: [],
      availablePeriods: [],
    };
  }

  const files = fs.readdirSync(companyDir);
  const csvFiles = files.filter(file => file.endsWith('.csv'));
  
  // Get available periods
  const availablePeriods = csvFiles
    .map(file => file.replace('.csv', ''))
    .sort();

  let allQuestions: LeetCodeQuestion[] = [];

  // CRITICAL FIX: If timePeriod is 'all' or not specified, only load from all.csv if it exists
  // This prevents duplicates from combining all.csv with other period files
  if (!timePeriod || timePeriod === 'all') {
    const allFile = csvFiles.find(file => file === 'all.csv');
    if (allFile) {
      // Only load from all.csv
      allQuestions = parseCompanyCSV(companyName, allFile);
    } else {
      // If all.csv doesn't exist, load from all files but deduplicate by ID
      const questionMap = new Map<string, LeetCodeQuestion>();
      for (const file of csvFiles) {
        const questions = parseCompanyCSV(companyName, file);
        for (const question of questions) {
          // Keep question with highest frequency if duplicate
          if (!questionMap.has(question.id) || questionMap.get(question.id)!.frequency < question.frequency) {
            questionMap.set(question.id, question);
          }
        }
      }
      allQuestions = Array.from(questionMap.values());
    }
  } else {
    // Load specific time period file
    const targetFile = csvFiles.find(file => file.replace('.csv', '') === timePeriod);
    if (targetFile) {
      allQuestions = parseCompanyCSV(companyName, targetFile);
    }
  }

  return {
    name: companyName,
    questions: allQuestions,
    availablePeriods,
  };
}

/**
 * Load data for multiple companies with optional time period filter
 */
export function loadMultipleCompaniesData(companyNames: string[], timePeriod?: string): CompanyData[] {
  return companyNames.map(companyName => loadCompanyData(companyName, timePeriod));
}

/**
 * Get all questions from all companies (for most frequent questions analysis)
 */
export function getAllQuestions(): LeetCodeQuestion[] {
  const companies = getAllCompanies();
  const allQuestions: LeetCodeQuestion[] = [];

  for (const company of companies) {
    const companyData = loadCompanyData(company);
    allQuestions.push(...companyData.questions);
  }

  return allQuestions;
}

/**
 * Find most frequent questions across all companies
 * Returns questions that appear in multiple companies, sorted by frequency
 * Now includes company tags in the question object
 */
export function getMostFrequentQuestions(minCompanies: number = 2): Array<LeetCodeQuestion & { companyTags?: string[] }> {
  const companies = getAllCompanies();
  const questionMap = new Map<string, {
    question: LeetCodeQuestion;
    companies: Set<string>;
    totalFrequency: number;
    count: number;
  }>();

  // Load all company data (only from all.csv to avoid duplicates)
  for (const company of companies) {
    const companyData = loadCompanyData(company, 'all');
    for (const question of companyData.questions) {
      const key = question.id;
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          question: { ...question, company: undefined }, // Remove company for aggregated view
          companies: new Set(),
          totalFrequency: 0,
          count: 0,
        });
      }

      const entry = questionMap.get(key)!;
      if (company) {
        entry.companies.add(company);
      }
      entry.totalFrequency += question.frequency;
      entry.count += 1;
    }
  }

  // Filter by minimum companies and calculate average frequency
  const frequentQuestions: Array<LeetCodeQuestion & { companyTags?: string[] }> = [];
  for (const [id, entry] of questionMap.entries()) {
    if (entry.companies.size >= minCompanies) {
      const avgFrequency = entry.totalFrequency / entry.count;
      frequentQuestions.push({
        ...entry.question,
        frequency: Math.round(avgFrequency * 100) / 100, // Round to 2 decimal places
        companyTags: Array.from(entry.companies).sort(), // Add company tags
      });
    }
  }

  // Sort by frequency (descending) and then by number of companies (descending)
  return frequentQuestions.sort((a, b) => {
    if (b.frequency !== a.frequency) {
      return b.frequency - a.frequency;
    }
    return 0;
  });
}

