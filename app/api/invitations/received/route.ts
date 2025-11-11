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

    // Get received invitations (where user's email matches recipientEmail or recipientUserId)
    const receivedInvitations = await db
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
        sender: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(invitations)
      .innerJoin(streaks, eq(invitations.streakId, streaks.id))
      .innerJoin(user, eq(invitations.senderId, user.id))
      .where(
        and(
          eq(invitations.recipientEmail, user.email),
          eq(invitations.status, 'pending')
        )
      )
      .orderBy(invitations.createdAt);

    return NextResponse.json(receivedInvitations);
  } catch (error) {
    console.error('Error fetching received invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}