interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  async sendInvitationEmail(data: {
    to: string;
    inviterName: string;
    streakTitle: string;
    invitationToken: string;
    message?: string;
  }) {
    const { to, inviterName, streakTitle, invitationToken, message } = data;

    // In a real implementation, you would use a service like Resend, Nodemailer, or SendGrid
    // For now, we'll just log the email that would be sent
    console.log('Invitation email would be sent:', {
      to,
      subject: `${inviterName} invited you to join "${streakTitle}" on StreakPair`,
      html: this.generateInvitationHtml({
        inviterName,
        streakTitle,
        invitationToken,
        message,
      }),
    });

    // Example with Resend (uncomment when you have a Resend API key):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const { data, error } = await resend.emails.send({
        from: 'StreakPair <noreply@streakpair.com>',
        to: [to],
        subject: `${inviterName} invited you to join "${streakTitle}" on StreakPair`,
        html: this.generateInvitationHtml({
          inviterName,
          streakTitle,
          invitationToken,
          message,
        }),
      });

      if (error) {
        console.error('Email send error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw error;
    }
    */

    return { success: true, logged: true };
  }

  private generateInvitationHtml(data: {
    inviterName: string;
    streakTitle: string;
    invitationToken: string;
    message?: string;
  }) {
    const { inviterName, streakTitle, invitationToken, message } = data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/invite/${invitationToken}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>StreakPair Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>StreakPair Invitation</h1>
          </div>
          <div class="content">
            <h2>${inviterName} invited you to a streak!</h2>
            <p>You've been invited to join the streak "<strong>${streakTitle}</strong>" on StreakPair.</p>
            ${message ? `<p><em>${message}</em></p>` : ''}
            <p>Click the button below to accept the invitation and start building habits together:</p>
            <a href="${acceptUrl}" class="button">Accept Invitation</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${acceptUrl}</p>
            <p>This invitation will expire in 7 days.</p>
          </div>
          <div class="footer">
            <p>StreakPair - Build Better Habits Together</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(data: {
    to: string;
    resetToken: string;
  }) {
    const { to, resetToken } = data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    console.log('Password reset email would be sent:', {
      to,
      subject: 'Reset your StreakPair password',
      html: `You requested a password reset. Click here: ${resetUrl}`,
    });

    return { success: true, logged: true };
  }

  async sendEmailVerificationEmail(data: {
    to: string;
    verificationToken: string;
  }) {
    const { to, verificationToken } = data;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    console.log('Email verification would be sent:', {
      to,
      subject: 'Verify your StreakPair email',
      html: `Please verify your email: ${verifyUrl}`,
    });

    return { success: true, logged: true };
  }
}

export const emailService = new EmailService();