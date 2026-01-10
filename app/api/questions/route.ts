import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { getFilteredQuestions, validateFilterOptions } from '@/lib/data-filter';
import { FilterOptions } from '@/types';

export async function POST(request: NextRequest) {
  // Authentication check - protect question data
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to access questions.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const options: FilterOptions = {
      companies: body.companies || [],
      difficulties: body.difficulties || [],
      minFrequency: body.minFrequency,
      maxFrequency: body.maxFrequency,
      timePeriod: body.timePeriod,
      showMostFrequent: body.showMostFrequent || false,
      multiCompanyMode: body.multiCompanyMode || 'union',
    };

    // Validate filter options
    const validation = validateFilterOptions(options);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid filter options', details: validation.errors },
        { status: 400 }
      );
    }

    // Get filtered questions
    const result = getFilteredQuestions(options);

    // Set caching headers (shorter cache for dynamic queries)
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json({
      questions: result.questions,
      totalCount: result.totalCount,
    }, { headers });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}






