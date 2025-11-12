import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, and } from 'drizzle-orm';
import { invitations, streaks, user } from '@/db/schema';
import { authenticate } from '@/lib/auth-middleware';

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

    // Get sent invitations with streak details
    const sentInvitations = await db
      .select({
        id: invitations.id,
        streakId: invitations.streakId,
        senderId: invitations.senderId,
        recipientEmail: invitations.recipientEmail,
        message: invitations.message,
        status: invitations.status,
        createdAt: invitations.createdAt,
        expiresAt: invitations.expiresAt,
        streak: {
          id: streaks.id,
          title: streaks.title,
          type: streaks.type,
          maxParticipants: streaks.maxParticipants,
        },
      })
      .from(invitations)
      .innerJoin(streaks, eq(invitations.streakId, streaks.id))
      .where(eq(invitations.senderId, user.id))
      .orderBy(invitations.createdAt);

    return NextResponse.json(sentInvitations);
  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}