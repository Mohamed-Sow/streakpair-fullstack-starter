import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { authenticate } from '@/lib/auth-middleware';
import { createStreakSchema } from '@/lib/validations/streak';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createStreakSchema.parse(body);

    // Create streak
    const streak = await streakService.createStreak({
      ...validatedData,
      creatorId: user.id,
    });

    return NextResponse.json(streak, { status: 201 });
  } catch (error) {
    console.error('Error creating streak:', error);

    if (error instanceof Error && error.message.includes('ValidationError')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Get user's streaks
    const streaks = await streakService.getUserStreaks(user.id);

    return NextResponse.json(streaks);
  } catch (error) {
    console.error('Error fetching streaks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}