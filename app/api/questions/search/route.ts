import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestions } from '@/lib/data-parser';

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS = 150;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q')?.trim() ?? '';

    if (rawQuery.length < MIN_SEARCH_LENGTH) {
      return NextResponse.json({
        questions: [],
        totalCount: 0,
      });
    }

    const normalizedQuery = rawQuery.toLowerCase();
    const allQuestions = getAllQuestions();
    const deduped = new Map<string, typeof allQuestions[number]>();

    for (const question of allQuestions) {
      const matchesTitle = question.title.toLowerCase().includes(normalizedQuery);
      const matchesId = question.id.toLowerCase().includes(normalizedQuery);

      if (!matchesTitle && !matchesId) {
        continue;
      }

      const existing = deduped.get(question.id);
      if (!existing || existing.frequency < question.frequency) {
        deduped.set(question.id, question);
      }
    }

    const results = Array.from(deduped.values())
      .sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return a.title.localeCompare(b.title);
      })
      .slice(0, MAX_RESULTS);

    return NextResponse.json({
      questions: results,
      totalCount: results.length,
    });
  } catch (error) {
    console.error('Error performing global question search:', error);
    return NextResponse.json(
      { error: 'Failed to search questions' },
      { status: 500 }
    );
  }
}


