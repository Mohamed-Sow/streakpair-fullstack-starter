import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { authenticate } from '@/lib/auth-middleware';
import { db } from '@/db';
import { checkIns, streaks, streakParticipants } from '@/db/schema/streaks';
import { and, gte, lte, eq, desc } from 'drizzle-orm';

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

    // Get URL search params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'all'; // week, month, all

    // Verify user is a participant in this streak
    const streak = await streakService.getStreakDetails(streakId, user.id);

    // Calculate date range based on timeRange
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'all':
      default:
        startDate.setDate(endDate.getDate() - 90); // Default to 90 days
        break;
    }

    // Fetch check-ins for the streak in the specified time range
    const streakCheckIns = await db
      .select({
        id: checkIns.id,
        userId: checkIns.userId,
        checkInDate: checkIns.checkInDate,
        completedAt: checkIns.completedAt,
        proofText: checkIns.proofText,
        proofImageUrl: checkIns.proofImageUrl,
      })
      .from(checkIns)
      .where(
        and(
          eq(checkIns.streakId, streakId),
          gte(checkIns.checkInDate, startDate.toISOString().split('T')[0]),
          lte(checkIns.checkInDate, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(checkIns.checkInDate));

    // Get participant count
    const participants = await db
      .select()
      .from(streakParticipants)
      .where(eq(streakParticipants.streakId, streakId));

    const participantCount = participants.length;

    // Calculate analytics
    const today = new Date().toISOString().split('T')[0];
    const sortedDates = Array.from(new Set(streakCheckIns.map(ci => ci.checkInDate))).sort();

    // Current streak calculation
    let currentStreak = 0;
    const todayIndex = sortedDates.indexOf(today);

    if (todayIndex === -1) {
      // Check if streak was broken yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdayIndex = sortedDates.indexOf(yesterdayStr);

      if (yesterdayIndex !== -1) {
        // Count backwards from yesterday
        for (let i = yesterdayIndex; i >= 0; i--) {
          const date = sortedDates[i];
          const dateCheckIns = streakCheckIns.filter(ci => ci.checkInDate === date);
          const uniqueUserIds = new Set(dateCheckIns.map(ci => ci.userId));

          if (uniqueUserIds.size === participantCount) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    } else {
      // Count backwards from today
      for (let i = todayIndex; i >= 0; i--) {
        const date = sortedDates[i];
        const dateCheckIns = streakCheckIns.filter(ci => ci.checkInDate === date);
        const uniqueUserIds = new Set(dateCheckIns.map(ci => ci.userId));

        if (uniqueUserIds.size === participantCount) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Longest streak calculation
    let longestStreak = 0;
    let tempStreak = 0;

    for (const date of sortedDates) {
      const dateCheckIns = streakCheckIns.filter(ci => ci.checkInDate === date);
      const uniqueUserIds = new Set(dateCheckIns.map(ci => ci.userId));

      if (uniqueUserIds.size === participantCount) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Total check-ins
    const totalCheckIns = streakCheckIns.length;

    // Completion rate
    const totalDays = sortedDates.length;
    const completedDays = new Set(
      streakCheckIns.map(ci => ci.checkInDate)
    ).size;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

    // Weekly progress (last 12 weeks)
    const weeklyProgress = [];
    const todayDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(todayDate);
      weekStart.setDate(todayDate.getDate() - (i * 7) - todayDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekCheckIns = streakCheckIns.filter(ci => {
        const checkInDate = new Date(ci.checkInDate);
        return checkInDate >= weekStart && checkInDate <= weekEnd;
      });

      const weekDays = Array.from(new Set(weekCheckIns.map(ci => ci.checkInDate))).length;
      const weekCompletionRate = weekDays > 0 ? (weekDays / 7) * 100 : 0;

      weeklyProgress.push({
        week: `Week ${12 - i}`,
        completionRate: Math.round(weekCompletionRate),
        totalCheckIns: weekCheckIns.length,
      });
    }

    // Generate streak history
    const streakHistory = sortedDates.map(date => {
      const dateCheckIns = streakCheckIns.filter(ci => ci.checkInDate === date);
      const uniqueUserIds = new Set(dateCheckIns.map(ci => ci.userId));

      return {
        date,
        completed: uniqueUserIds.size === participantCount,
        participantCount: uniqueUserIds.size,
        totalParticipants: participantCount,
      };
    }).reverse();

    // Calculate weekly and monthly averages
    const recentWeeklyProgress = weeklyProgress.slice(-4);
    const weeklyCompletionRate = recentWeeklyProgress.reduce((acc, week) => acc + week.completionRate, 0) / recentWeeklyProgress.length;
    const monthlyCompletionRate = weeklyCompletionRate; // Using 4 weeks as a month

    // Generate milestones based on achievements
    const milestones = [];

    if (currentStreak >= 7) {
      milestones.push({
        id: 'first-week',
        title: 'First Week Complete',
        description: 'Completed your first full week of check-ins',
        achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '🗓️',
      });
    }

    if (currentStreak >= 14) {
      milestones.push({
        id: 'two-weeks',
        title: 'Two Week Streak',
        description: 'Maintained consistency for two full weeks',
        achievedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '🔥',
      });
    }

    if (currentStreak >= 30) {
      milestones.push({
        id: 'thirty-days',
        title: '30 Day Warrior',
        description: 'An entire month of consistent progress',
        achievedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '💪',
      });
    }

    // Generate insights
    const insights = [];

    if (completionRate >= 80) {
      insights.push({
        type: 'strength',
        title: 'Incredibly Consistent',
        description: `${Math.round(completionRate)}% completion rate shows amazing dedication!`,
      });
    } else if (completionRate >= 60) {
      insights.push({
        type: 'strength',
        title: 'Great Progress',
        description: `${Math.round(completionRate)}% completion rate - keep up the good work!`,
      });
    }

    if (currentStreak >= 7) {
      insights.push({
        type: 'milestone',
        title: 'Current Week Streak',
        description: `You're on a ${currentStreak}-day streak! Don't break the chain.`,
      });
    }

    if (weeklyCompletionRate < 60) {
      insights.push({
        type: 'improvement',
        title: 'Room for Growth',
        description: 'Try setting a daily reminder to boost your consistency',
      });
    }

    const analytics = {
      currentStreak,
      longestStreak,
      totalCheckIns,
      completionRate: Math.round(completionRate),
      weeklyCompletionRate: Math.round(weeklyCompletionRate),
      monthlyCompletionRate: Math.round(monthlyCompletionRate),
      streakHistory,
      weeklyProgress,
      milestones,
      insights,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching streak analytics:', error);

    if (error instanceof Error && error.message.includes('not a participant')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Streak not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}