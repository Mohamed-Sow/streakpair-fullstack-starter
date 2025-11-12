#!/usr/bin/env tsx

import { db } from './db';
import { streaks, streakParticipants, user, invitations } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { streakService } from './lib/services/streak.service';
import crypto from 'crypto';

async function testInvitationFlow() {
  console.log('=== Testing Complete Invitation Flow ===\n');
  
  try {
    // Step 1: Create a test user or get existing one
    console.log('Step 1: Getting/Creating test user...');
    const testUserId = crypto.randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Insert test user directly (bypassing auth for testing)
    const [testUser] = await db.insert(user)
      .values({
        id: testUserId,
        name: 'Test User',
        email: testEmail,
        emailVerified: false,
      })
      .returning()
      .onConflictDoNothing();
    
    const actualUser = testUser || (await db.query.user.findFirst({
      where: eq(user.email, testEmail),
    }));
    
    if (!actualUser) {
      console.error('Could not create or find test user');
      return;
    }
    
    console.log(`User created/found: ${actualUser.id} (${actualUser.email})\n`);

    // Step 2: Create a streak using the service
    console.log('Step 2: Creating streak...');
    const streakData = {
      title: 'Test Streak ' + Date.now(),
      description: 'Testing invitation bug fix',
      category: 'fitness',
      type: 'duo' as const,
      maxParticipants: 2,
      timezone: 'UTC',
    };
    
    const newStreak = await streakService.createStreak({
      ...streakData,
      creatorId: actualUser.id,
    });
    
    console.log(`Streak created: ${newStreak.id}\n`);

    // Step 3: Verify participant was added
    console.log('Step 3: Verifying participant record...');
    const participants = await db.query.streakParticipants.findMany({
      where: eq(streakParticipants.streakId, newStreak.id),
    });
    
    console.log('Participants found:', participants.length);
    participants.forEach(p => {
      console.log(`  - User: ${p.userId}, Role: ${p.role}, Active: ${p.isActive}`);
    });
    console.log();

    // Step 4: Test sending invitation
    console.log('Step 4: Testing invitation...');
    const recipientEmail = 'partner@example.com';
    
    try {
      const invitation = await streakService.sendInvitation({
        streakId: newStreak.id,
        senderId: actualUser.id,
        recipientEmail,
        message: 'Join me on this fitness journey!',
      });
      
      console.log('✅ INVITATION SENT SUCCESSFULLY!');
      console.log(`Invitation ID: ${invitation.id}`);
      console.log(`Token: ${invitation.token}`);
      console.log(`Recipient: ${invitation.recipientEmail}`);
      console.log(`Expires: ${invitation.expiresAt}\n`);
      
      // Step 5: Verify invitation in database
      const dbInvitation = await db.query.invitations.findFirst({
        where: eq(invitations.id, invitation.id),
      });
      
      if (dbInvitation) {
        console.log('✅ Invitation verified in database');
        console.log('Invitation details:', {
          id: dbInvitation.id,
          streakId: dbInvitation.streakId,
          senderId: dbInvitation.senderId,
          recipientEmail: dbInvitation.recipientEmail,
          status: dbInvitation.status,
        });
      }
      
    } catch (error) {
      console.error('❌ INVITATION FAILED:', error);
      
      // Show detailed error info
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }

    // Cleanup: Delete test data
    console.log('\nStep 6: Cleaning up test data...');
    await db.delete(invitations).where(eq(invitations.streakId, newStreak.id));
    await db.delete(streakParticipants).where(eq(streakParticipants.streakId, newStreak.id));
    await db.delete(streaks).where(eq(streaks.id, newStreak.id));
    await db.delete(user).where(eq(user.id, actualUser.id));
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testInvitationFlow();