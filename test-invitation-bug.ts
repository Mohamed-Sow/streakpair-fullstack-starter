import { db } from '@/db';
import { streaks, streakParticipants } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function testInvitationBug() {
  console.log('=== Testing Invitation Bug ===\n');

  // Test case 1: Check if a recently created streak has the participant record
  const testStreakId = process.env.TEST_STREAK_ID || '';
  const testUserId = process.env.TEST_USER_ID || '';

  if (testStreakId && testUserId) {
    console.log('Testing with streak ID:', testStreakId);
    console.log('Testing with user ID:', testUserId);

    // Check if the participant record exists
    const participants = await db.query.streakParticipants.findMany({
      where: eq(streakParticipants.streakId, testStreakId),
    });

    console.log('\nAll participants in streak:');
    console.log(JSON.stringify(participants, null, 2));

    // Check with the exact query used in sendInvitation
    const sender = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, testStreakId),
        eq(streakParticipants.userId, testUserId),
        eq(streakParticipants.isActive, true)
      ),
    });

    console.log('\nSender participant record (exact query from sendInvitation):');
    console.log(JSON.stringify(sender, null, 2));

    // Also check without isActive filter
    const senderWithoutActive = await db.query.streakParticipants.findFirst({
      where: and(
        eq(streakParticipants.streakId, testStreakId),
        eq(streakParticipants.userId, testUserId)
      ),
    });

    console.log('\nSender participant record (without isActive filter):');
    console.log(JSON.stringify(senderWithoutActive, null, 2));
  } else {
    console.log('Please set TEST_STREAK_ID and TEST_USER_ID environment variables to test specific data.');
  }

  // Test case 2: List all participants to debug
  console.log('\n=== Listing ALL Participants in Database ===');
  const allParticipants = await db.query.streakParticipants.findMany({
    limit: 10,
  });

  console.log(JSON.stringify(allParticipants, null, 2));

  process.exit(0);
}

testInvitationBug().catch(console.error);