import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { authenticate } from '@/lib/auth-middleware';
import { z } from 'zod';

const acceptInvitationSchema = z.object({
  token: z.string().uuid('Invalid invitation token'),
});

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
    const { token } = acceptInvitationSchema.parse(body);

    // Accept invitation
    const streak = await streakService.acceptInvitation(token, user.id);

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      streak,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid invitation token')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('already been processed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { error: error.message },
          { status: 410 }
        );
      }
      if (error.message.includes('already a participant')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes('reached maximum participants')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}