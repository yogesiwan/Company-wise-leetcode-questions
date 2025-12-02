import { NextRequest, NextResponse } from 'next/server';
import { getMostFrequentQuestions } from '@/lib/data-parser';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minCompanies = parseInt(searchParams.get('minCompanies') || '2', 10);

    if (isNaN(minCompanies) || minCompanies < 1) {
      return NextResponse.json(
        { error: 'Invalid minCompanies parameter' },
        { status: 400 }
      );
    }

    const questions = getMostFrequentQuestions(minCompanies);
    
    return NextResponse.json({
      questions,
      totalCount: questions.length,
    });
  } catch (error) {
    console.error('Error fetching most frequent questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch most frequent questions' },
      { status: 500 }
    );
  }
}

