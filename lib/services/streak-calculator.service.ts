import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { checkIns, streakParticipants, streaks } from '@/db/schema';
import {
  canCheckInToday,
  getTodayDateString,
  calculateConsecutiveDays,
  areDatesConsecutive,
  getDateRange,
  formatDateForDisplay
} from '@/lib/utils/timezone';

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  hasCheckedInToday: boolean;
  streakHistory: {
    date: string;
    checkedIn: boolean;
    participants: string[];
  }[];
  participantStatus: {
    userId: string;
    hasCheckedInToday: boolean;
    streakDays: number;
    lastCheckInDate: string | null;
  }[];
}

export class StreakCalculatorService {
  /**
   * Calculate streak status for a specific streak and user
   */
  async calculateStreakStatus(streakId: string, userId: string): Promise<StreakStatus> {
    // Get streak details
    const streak = await db.query.streaks.findFirst({
      where: eq(streaks.id, streakId),
    });

    if (!streak) {
      throw new Error('Streak not found');
    }

    // Get all participants
    const participants = await db.query.streakParticipants.findMany({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.isActive, true)
      ),
    });

    const participantIds = participants.map(p => p.userId);
    const today = getTodayDateString(streak.timezone);
    const canCheckIn = canCheckInToday(streak.timezone);

    // Get check-in history for all participants
    const checkInHistory = await db
      .select({
        userId: checkIns.userId,
        checkInDate: checkIns.checkInDate,
        completedAt: checkIns.completedAt,
      })
      .from(checkIns)
      .where(eq(checkIns.streakId, streakId))
      .orderBy(desc(checkIns.checkInDate));

    // Group check-ins by user
    const checkInsByUser: Record<string, string[]> = {};
    participantIds.forEach(id => {
      checkInsByUser[id] = [];
    });

    checkInHistory.forEach(checkIn => {
      if (checkInsByUser[checkIn.userId]) {
        checkInsByUser[checkIn.userId].push(checkIn.checkInDate);
      }
    });

    // Calculate user's current streak
    const userStreakData = this.calculateUserStreak(
      checkInsByUser[userId] || [],
      streak.timezone
    );

    // Calculate participant status
    const participantStatus = participantIds.map(participantId => {
      const participantStreakData = this.calculateUserStreak(
        checkInsByUser[participantId] || [],
        streak.timezone
      );

      return {
        userId: participantId,
        hasCheckedInToday: (checkInsByUser[participantId] || []).includes(today),
        streakDays: participantStreakData.currentStreak,
        lastCheckInDate: participantStreakData.lastCheckInDate,
      };
    });

    // Generate streak history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const historyDates = getDateRange(
      thirtyDaysAgo.toISOString().split('T')[0],
      today
    );

    const streakHistory = historyDates.map(date => {
      const checkedInParticipants: string[] = [];

      checkInHistory.forEach(checkIn => {
        if (checkIn.checkInDate === date) {
          checkedInParticipants.push(checkIn.userId);
        }
      });

      return {
        date,
        checkedIn: checkedInParticipants.length > 0,
        participants: checkedInParticipants,
      };
    });

    return {
      currentStreak: userStreakData.currentStreak,
      longestStreak: userStreakData.longestStreak,
      lastCheckInDate: userStreakData.lastCheckInDate,
      hasCheckedInToday: userStreakData.hasCheckedInToday,
      streakHistory,
      participantStatus,
    };
  }

  /**
   * Calculate a user's streak data from their check-in dates
   */
  private calculateUserStreak(checkInDates: string[], timezone: string) {
    if (checkInDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInDate: null,
        hasCheckedInToday: false,
      };
    }

    // Sort dates in ascending order
    const sortedDates = [...checkInDates].sort();
    const today = getTodayDateString(timezone);

    // Check if user has checked in today
    const hasCheckedInToday = sortedDates.includes(today);
    const lastCheckInDate = sortedDates[sortedDates.length - 1];

    // Calculate current streak
    let currentStreak = 0;
    const checkDate = hasCheckedInToday ? today :
                     sortedDates.includes(this.getYesterday(today)) ? this.getYesterday(today) :
                     lastCheckInDate;

    if (checkDate) {
      currentStreak = this.calculateCurrentStreak(sortedDates, checkDate);
    }

    // Calculate longest streak
    const longestStreak = this.calculateLongestStreak(sortedDates);

    return {
      currentStreak,
      longestStreak,
      lastCheckInDate,
      hasCheckedInToday,
    };
  }

  /**
   * Calculate current streak count from a list of check-in dates
   */
  private calculateCurrentStreak(checkInDates: string[], endDate: string): number {
    const sortedDates = [...checkInDates].sort();
    let streak = 0;
    let currentDate = endDate;

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (sortedDates[i] === currentDate) {
        streak++;
        currentDate = this.getYesterday(currentDate);
      } else if (sortedDates[i] < currentDate) {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate the longest streak from a list of check-in dates
   */
  private calculateLongestStreak(checkInDates: string[]): number {
    if (checkInDates.length === 0) return 0;

    const sortedDates = [...checkInDates].sort();
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      if (areDatesConsecutive(sortedDates[i - 1], sortedDates[i])) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  /**
   * Get yesterday's date string
   */
  private getYesterday(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if a streak should be broken based on missed check-ins
   */
  async checkStreakBreakage(streakId: string): Promise<{
    isBroken: boolean;
    brokenDate: string | null;
    affectedUsers: string[];
  }> {
    const streak = await db.query.streaks.findFirst({
      where: eq(streaks.id, streakId),
    });

    if (!streak) {
      throw new Error('Streak not found');
    }

    const today = getTodayDateString(streak.timezone);
    const yesterday = this.getYesterday(today);

    // Get all participants
    const participants = await db.query.streakParticipants.findMany({
      where: and(
        eq(streakParticipants.streakId, streakId),
        eq(streakParticipants.isActive, true)
      ),
    });

    // Check if anyone checked in yesterday
    const yesterdayCheckIns = await db
      .select({ userId: checkIns.userId })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.streakId, streakId),
          eq(checkIns.checkInDate, yesterday)
        )
      );

    const usersWhoCheckedInYesterday = yesterdayCheckIns.map(ci => ci.userId);
    const affectedUsers = participants.filter(p =>
      !usersWhoCheckedInYesterday.includes(p.userId)
    ).map(p => p.userId);

    const isBroken = affectedUsers.length === participants.length;
    const brokenDate = isBroken ? yesterday : null;

    return {
      isBroken,
      brokenDate,
      affectedUsers,
    };
  }

  /**
   * Format streak duration for display
   */
  formatStreakDuration(days: number): string {
    if (days === 0) return 'No active streak';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  }
}

export const streakCalculatorService = new StreakCalculatorService();