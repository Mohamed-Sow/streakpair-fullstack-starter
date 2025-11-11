import { NextRequest, NextResponse } from 'next/server';
import { streakCalculatorService } from '@/lib/services/streak-calculator.service';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const streakId = params.id;

    // Calculate streak status
    const streakStatus = await streakCalculatorService.calculateStreakStatus(
      streakId,
      user.id
    );

    return NextResponse.json(streakStatus);
  } catch (error) {
    console.error('Error calculating streak status:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Streak not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('not a participant')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}