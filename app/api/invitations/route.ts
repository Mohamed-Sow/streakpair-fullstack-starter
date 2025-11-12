import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { emailService } from '@/lib/services/email.service';
import { authenticate } from '@/lib/auth-middleware';
import { sendInvitationSchema } from '@/lib/validations/streak';

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
    const validatedData = sendInvitationSchema.parse(body);

    const { streakId, recipientEmail, message } = validatedData;

    // Send invitation
    const invitation = await streakService.sendInvitation({
      streakId,
      senderId: user.id,
      recipientEmail,
      message,
    });

    // Send email invitation
    try {
      // We need to get streak details for the email
      const streakDetails = await streakService.getStreakDetails(streakId, user.id);

      await emailService.sendInvitationEmail({
        to: recipientEmail,
        inviterName: user.name || 'Someone',
        streakTitle: streakDetails.title,
        invitationToken: invitation.token,
        message,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    console.error('Error sending invitation:', error);

    if (error instanceof Error && error.message.includes('not a participant')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('Validation')) {
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