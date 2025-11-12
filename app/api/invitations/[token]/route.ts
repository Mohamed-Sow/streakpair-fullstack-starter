import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { invitations, streaks, streakParticipants, user } from '@/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Find invitation with related data
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
      with: {
        streak: {
          with: {
            participants: {
              where: eq(streakParticipants.isActive, true),
              with: {
                user: true,
              },
            },
          },
        },
        sender: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Update status to expired if it's still pending
      if (invitation.status === 'pending') {
        await db
          .update(invitations)
          .set({ status: 'expired' })
          .where(eq(invitations.id, invitation.id));
      }
    }

    // Format response
    const response = {
      id: invitation.id,
      streak: {
        id: invitation.streak.id,
        title: invitation.streak.title,
        description: invitation.streak.description,
        category: invitation.streak.category,
        type: invitation.streak.type,
        maxParticipants: invitation.streak.maxParticipants,
        timezone: invitation.streak.timezone,
        participants: invitation.streak.participants.map(p => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          image: p.user.image,
          role: p.role,
        })),
      },
      sender: {
        id: invitation.sender.id,
        name: invitation.sender.name,
        email: invitation.sender.email,
        image: invitation.sender.image,
      },
      recipientEmail: invitation.recipientEmail,
      message: invitation.message,
      status: invitation.expiresAt < new Date() && invitation.status === 'pending' ? 'expired' : invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}