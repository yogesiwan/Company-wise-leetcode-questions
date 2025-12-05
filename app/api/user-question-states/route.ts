import { NextRequest, NextResponse } from 'next/server';
import { getDb, UserQuestionState } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

// GET /api/user-question-states?ids=1,2,3
export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session || !session.user?.email) {
    return NextResponse.json({ states: [] });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ states: [] });
  }

  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ states: [] });
  }

  try {
    const db = await getDb();
    const collection = db.collection<UserQuestionState>('userQuestionStates');

    const docs = await collection
      .find({
        userId: session.user.email,
        questionId: { $in: ids },
      })
      .toArray();

    return NextResponse.json({
      states: docs.map((doc) => ({
        questionId: doc.questionId,
        done: doc.done,
        note: doc.note,
      })),
    });
  } catch (error) {
    console.error('Error fetching user question states:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user question states' },
      { status: 500 },
    );
  }
}

// PATCH /api/user-question-states
// { questionId, done?, note? }
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const body = await request.json();
  const questionId: string | undefined = body.questionId;
  const done: boolean | undefined = body.done;
  const note: string | undefined = body.note;

  if (!questionId) {
    return NextResponse.json(
      { error: 'questionId is required' },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    const collection = db.collection<UserQuestionState>('userQuestionStates');

    const update: Partial<UserQuestionState> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (typeof done === 'boolean') {
      update.done = done;
    }
    if (typeof note === 'string') {
      update.note = note;
    }

    const result = await collection.findOneAndUpdate(
      { userId: session.user.email, questionId },
      {
        $set: update,
        $setOnInsert: {
          userId: session.user.email,
          questionId,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { error: 'Failed to update state' },
        { status: 500 },
      );
    }

    const doc = result.value;

    return NextResponse.json({
      questionId: doc.questionId,
      done: doc.done,
      note: doc.note,
    });
  } catch (error) {
    console.error('Error updating user question state:', error);
    return NextResponse.json(
      { error: 'Failed to update user question state' },
      { status: 500 },
    );
  }
}


