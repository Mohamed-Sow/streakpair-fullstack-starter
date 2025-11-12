import { eq, and, desc, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  streaks,
  streakParticipants,
  checkIns,
  invitations,
  type NewStreak,
  type NewStreakParticipant,
  type NewCheckIn,
  type NewInvitation
} from '@/db/schema';

export class StreakService {
  // Create a new streak
  async createStreak(data: NewStreak & { creatorId: string }) {
    const { creatorId, ...streakData } = data;

    const [newStreak] = await db.insert(streaks)
      .values({
        ...streakData,
        createdBy: creatorId,
      })
      .returning();

    // Add creator as participant
    await db.insert(streakParticipants)
      .values({
        streakId: newStreak.id,
        userId: creatorId,
        role: 'owner',
      });

    return newStreak;
  }

  // Get streaks for a user
  async getUserStreaks(userId: string) {
    const userStreaks = await db
      .select({
        id: streaks.id,
        title: streaks.title,
        description: streaks.description,
        category: streaks.category,
        status: streaks.status,
        type: streaks.type,
        maxParticipants: streaks.maxParticipants,
        timezone: streaks.timezone,
        reminderTime: streaks.reminderTime,
        createdAt: streaks.createdAt,
        updatedAt: streaks.updatedAt,
        role: streakParticipants.role,
        participantCount: count(streakParticipants.userId).as('participant_count'),
      })
      .from(streakParticipants)
      .innerJoin(streaks, eq(streakParticipants.streakId, streaks.id))
      .where(
        and(
          eq(streakParticipants.userId, userId),
          eq(streakParticipants.isActive, true),
          eq(streaks.status, 'active')
        )
      )
      .groupBy(streaks.id, streakParticipants.role)
      .orderBy(desc(streaks.updatedAt));

    return userStreaks;
  }

  // Get streak details with participants
  async getStreakDetails(streakId: string, userId: string) {
    // Check if user is participant
    const participant = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.userId, userId),
        eq(streakParticipants.isActive, true)
      ),
    });

    if (!participant) {
      throw new Error('User is not a participant in this streak');
    }

    const streakDetails = await db.query.streaks.findFirst({
      where: eq(streaks.id, streakId),
      with: {
        participants: {
          where: eq(streakParticipants.isActive, true),
          with: {
            user: true,
          },
        },
        _count: {
          select: {
            participants: {
              where: eq(streakParticipants.isActive, true),
            },
          },
        },
      },
    });

    return streakDetails;
  }

  // Send invitation to streak
  async sendInvitation(data: {
    streakId: string;
    senderId: string;
    recipientEmail: string;
    message?: string;
  }) {
    const { streakId, senderId, recipientEmail, message } = data;

    // Check if sender is owner or participant
    const sender = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.userId, senderId),
        eq(streakParticipants.isActive, true)
      ),
    });

    if (!sender) {
      throw new Error('Sender is not a participant in this streak');
    }

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const [invitation] = await db.insert(invitations)
      .values({
        streakId,
        senderId,
        recipientEmail,
        token,
        message,
        expiresAt,
      })
      .returning();

    return invitation;
  }

  // Accept invitation
  async acceptInvitation(token: string, userId: string) {
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
      with: {
        streak: true,
      },
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been processed');
    }

    if (invitation.expiresAt < new Date()) {
      await db.update(invitations)
        .set({ status: 'expired' })
        .where(eq(invitations.id, invitation.id));
      throw new Error('Invitation has expired');
    }

    // Check if user is already a participant
    const existingParticipant = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, invitation.streakId),
        eq(streakParticipants.userId, userId)
      ),
    });

    if (existingParticipant) {
      throw new Error('User is already a participant in this streak');
    }

    // Check max participants
    const participantCount = await db.query.streakParticipants.findMany({
      where: and(
        eq(streakParticipants.streakId, invitation.streakId),
        eq(streakParticipants.isActive, true)
      ),
    });

    if (participantCount.length >= invitation.streak.maxParticipants) {
      throw new Error('Streak has reached maximum participants');
    }

    // Add user as participant
    await db.insert(streakParticipants)
      .values({
        streakId: invitation.streakId,
        userId,
        role: 'participant',
      });

    // Update invitation
    await db.update(invitations)
      .set({
        status: 'accepted',
        recipientUserId: userId,
        acceptedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));

    return invitation.streak;
  }

  // Check in for today
  async checkIn(data: {
    streakId: string;
    userId: string;
    proofText?: string;
    proofImageUrl?: string;
  }) {
    const { streakId, userId, proofText, proofImageUrl } = data;

    // Check if user is active participant
    const participant = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.userId, userId),
        eq(streakParticipants.isActive, true)
      ),
    });

    if (!participant) {
      throw new Error('User is not an active participant in this streak');
    }

    // Check for duplicate check-in today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const existingCheckIn = await db.query.checkIns.findFirst({
      where: and(
        eq(checkIns.streakId, streakId),
        eq(checkIns.userId, userId),
        eq(checkIns.checkInDate, today)
      ),
    });

    if (existingCheckIn) {
      throw new Error('User has already checked in today');
    }

    // Create check-in record
    const [newCheckIn] = await db.insert(checkIns)
      .values({
        streakId,
        userId,
        checkInDate: today,
        proofText,
        proofImageUrl,
        completedAt: new Date(),
      })
      .returning();

    return newCheckIn;
  }

  // Get check-in history for a streak
  async getCheckInHistory(streakId: string, userId: string) {
    // Verify user is participant
    const participant = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.userId, userId),
        eq(streakParticipants.isActive, true)
      ),
    });

    if (!participant) {
      throw new Error('User is not a participant in this streak');
    }

    const history = await db.query.checkIns.findMany({
      where: eq(checkIns.streakId, streakId),
      with: {
        user: true,
      },
      orderBy: desc(checkIns.completedAt),
    });

    return history;
  }

  // Get today's check-in status for all participants
  async getTodayCheckInStatus(streakId: string, userId: string) {
    const participant = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.userId, userId),
        eq(streakParticipants.isActive, true)
      ),
    });

    if (!participant) {
      throw new Error('User is not a participant in this streak');
    }

    const today = new Date().toISOString().split('T')[0];

    const checkInsToday = await db
      .select({
        userId: checkIns.userId,
        user: streakParticipants.userId,
        hasCheckedIn: sql<boolean>`true`.as('has_checked_in'),
        completedAt: checkIns.completedAt,
        proofText: checkIns.proofText,
        proofImageUrl: checkIns.proofImageUrl,
      })
      .from(checkIns)
      .rightJoin(
        streakParticipants,
        and(
          eq(streakParticipants.streakId, streakId),
          eq(streakParticipants.isActive, true)
        )
      )
      .where(
        and(
          eq(streakParticipants.streakId, streakId),
          eq(streakParticipants.isActive, true),
          sql`${checkIns.checkInDate} = ${today} OR ${checkIns.checkInDate} IS NULL`
        )
      );

    return checkInsToday.map(record => ({
      userId: record.userId || record.user,
      hasCheckedIn: !!record.hasCheckedIn,
      completedAt: record.completedAt,
      proofText: record.proofText,
      proofImageUrl: record.proofImageUrl,
    }));
  }
}

export const streakService = new StreakService();