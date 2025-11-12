import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streak.service';
import { authenticate } from '@/lib/auth-middleware';
import { db } from '@/db';
import { checkIns, streaks, streakParticipants } from '@/db/schema/streaks';
import { and, gte, lte, eq, desc } from 'drizzle-orm';

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

    // Get URL search params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const range = searchParams.get('range') || '30days';

    // Verify user is a participant in this streak
    const streak = await streakService.getStreakDetails(streakId, user.id);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(endDate.getFullYear() - 5); // Go back 5 years
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
        break;
    }

    // Fetch streak details and check-ins
    const streakDetails = await db
      .select()
      .from(streaks)
      .where(eq(streaks.id, streakId))
      .limit(1);

    const participants = await db
      .select({
        userId: streakParticipants.userId,
        role: streakParticipants.role,
        joinedAt: streakParticipants.joinedAt,
      })
      .from(streakParticipants)
      .where(eq(streakParticipants.streakId, streakId));

    const streakCheckIns = await db
      .select({
        id: checkIns.id,
        userId: checkIns.userId,
        checkInDate: checkIns.checkInDate,
        completedAt: checkIns.completedAt,
        proofText: checkIns.proofText,
        proofImageUrl: checkIns.proofImageUrl,
        verified: checkIns.verified,
        verifiedAt: checkIns.verifiedAt,
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

    // User's check-ins only (for privacy)
    const userCheckIns = streakCheckIns.filter(ci => ci.userId === user.id);

    // Generate export data
    const exportData = {
      streak: {
        id: streakDetails[0]?.id,
        title: streakDetails[0]?.title,
        description: streakDetails[0]?.description,
        category: streakDetails[0]?.category,
        type: streakDetails[0]?.type,
        timezone: streakDetails[0]?.timezone,
        createdAt: streakDetails[0]?.createdAt,
      },
      exportInfo: {
        exportedAt: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          label: range,
        },
        format,
        exportedBy: user.id,
      },
      analytics: {
        totalCheckIns: userCheckIns.length,
        totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        participantCount: participants.length,
      },
      checkIns: userCheckIns.map(ci => ({
        date: ci.checkInDate,
        completedAt: ci.completedAt,
        hasProof: !!ci.proofText || !!ci.proofImageUrl,
        proofText: ci.proofText ? '[REDACTED]' : undefined,
        hasProofImage: !!ci.proofImageUrl,
        verified: ci.verified,
      })),
      // Anonymized team data (just dates and completion status)
      teamProgress: streakCheckIns.reduce((acc, ci) => {
        const date = ci.checkInDate;
        if (!acc[date]) {
          acc[date] = {
            date,
            totalCheckIns: 0,
            uniqueUsers: new Set(),
          };
        }
        acc[date].totalCheckIns++;
        acc[date].uniqueUsers.add(ci.userId);
        return acc;
      }, {} as Record<string, {
        date: string;
        totalCheckIns: number;
        uniqueUsers: Set<string>;
      }>),
    };

    // Convert teamProgress unique users to counts
    Object.values(exportData.teamProgress).forEach(day => {
      (day as any).uniqueUserCount = (day as any).uniqueUsers.size;
      delete (day as any).uniqueUsers;
    });

    // Generate different format responses
    switch (format) {
      case 'json':
        return new NextResponse(JSON.stringify(exportData, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="streak-${streak.title.toLowerCase().replace(/\s+/g, '-')}-${range}.json"`,
          },
        });

      case 'csv':
        // Generate CSV for user's check-ins
        const csvHeaders = [
          'Date',
          'Completed At',
          'Has Proof',
          'Verified',
        ];

        const csvRows = [
          `Streak: ${streak.title}`,
          `Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          `Exported: ${new Date().toISOString()}`,
          '',
          csvHeaders.join(','),
          ...userCheckIns.map(ci => [
            ci.checkInDate,
            ci.completedAt,
            ci.proofText || ci.proofImageUrl ? 'Yes' : 'No',
            ci.verified ? 'Yes' : 'No',
          ].map(field => `"${field}"`).join(',')),
        ].join('\n');

        return new NextResponse(csvRows, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="streak-${streak.title.toLowerCase().replace(/\s+/g, '-')}-${range}.csv"`,
          },
        });

      case 'pdf':
        // For PDF, we'll return a simple text report
        // In a real app, you'd use a PDF library like jsPDF or Puppeteer
        const reportLines = [
          `STREAK PROGRESS REPORT`,
          `=====================`,
          ``,
          `Streak: ${streak.title}`,
          `Category: ${streak.category}`,
          `Type: ${streak.type}`,
          `Timezone: ${streak.timezone}`,
          ``,
          `Report Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          `Generated: ${new Date().toLocaleString()}`,
          ``,
          `SUMMARY`,
          `--------`,
          `Your Total Check-ins: ${userCheckIns.length}`,
          `Days in Period: ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}`,
          `Team Size: ${participants.length}`,
          ``,
          `YOUR CHECK-IN HISTORY`,
          `---------------------`,
          ...userCheckIns.map(ci =>
            `${ci.checkInDate} - Completed at ${new Date(ci.completedAt).toLocaleString()} ${ci.verified ? '(✓)' : ''}`
          ),
          ``,
          `TEAM COMPLETION SUMMARY`,
          `-----------------------`,
          ...Object.values(exportData.teamProgress)
            .sort((a, b) => (b as any).date.localeCompare((a as any).date))
            .map((day: any) =>
              `${day.date}: ${day.uniqueUserCount}/${participants.length} participants checked in`
            ),
        ];

        return new NextResponse(reportLines.join('\n'), {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="streak-${streak.title.toLowerCase().replace(/\s+/g, '-')}-${range}.txt"`,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting streak data:', error);

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