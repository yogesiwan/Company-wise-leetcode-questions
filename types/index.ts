export interface LeetCodeQuestion {
  id: string;
  url: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptanceRate: number;
  frequency: number;
  company?: string;
  companyTags?: string[]; // For most frequent questions showing multiple companies
  timePeriod?: 'all' | 'six-months' | 'three-months' | 'more-than-six-months' | 'thirty-days';
}

export interface CompanyData {
  name: string;
  questions: LeetCodeQuestion[];
  availablePeriods: string[];
}

export interface FilterOptions {
  companies: string[];
  difficulties: string[];
  minFrequency?: number;
  maxFrequency?: number;
  timePeriod?: string;
  showMostFrequent?: boolean;
  multiCompanyMode?: 'union' | 'intersection';
}

