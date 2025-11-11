import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { authenticate } from '@/lib/auth-middleware';
import { checkInSchema } from '@/lib/validations/streak';

export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkInSchema.parse(body);

    // Create check-in
    const checkIn = await streakService.checkIn({
      streakId,
      userId: user.id,
      ...validatedData,
    });

    return NextResponse.json({
      message: 'Check-in successful!',
      checkIn,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating check-in:', error);

    if (error instanceof Error) {
      if (error.message.includes('not an active participant')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes('already checked in today')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes('Validation')) {
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get today's check-in status for all participants
    const checkInStatus = await streakService.getTodayCheckInStatus(streakId, user.id);

    return NextResponse.json(checkInStatus);
  } catch (error) {
    console.error('Error fetching check-in status:', error);

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