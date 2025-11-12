import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const { id: streakId } = await params;
    
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Get check-in history for the streak
    const history = await streakService.getCheckInHistory(streakId, user.id);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching check-in history:', error);

    if (error instanceof Error && error.message.includes('not a participant')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}