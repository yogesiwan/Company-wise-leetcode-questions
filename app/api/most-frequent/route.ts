import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { getMostFrequentQuestions } from '@/lib/data-parser';

export async function GET(request: NextRequest) {
  // Authentication check - protect question data
  const session = await getServerSession(authConfig);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to access most frequent questions.' },
      { status: 401 }
    );
  }

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




