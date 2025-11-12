#!/usr/bin/env tsx

import { db } from './db';
import { streaks, streakParticipants, user, invitations } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { streakService } from './lib/services/streak.service';
import crypto from 'crypto';

async function testAcceptanceFlow() {
  console.log('=== Testing Invitation Acceptance Flow ===\n');
  
  let createdUserIds: string[] = [];
  let createdStreakId: string | null = null;
  
  try {
    // Step 1: Create sender user
    console.log('Step 1: Creating sender user...');
    const senderId = crypto.randomUUID();
    const senderEmail = `sender-${Date.now()}@example.com`;
    
    const [senderUser] = await db.insert(user)
      .values({
        id: senderId,
        name: 'Sender User',
        email: senderEmail,
        emailVerified: false,
      })
      .returning();
    
    createdUserIds.push(senderUser.id);
    console.log(`Sender created: ${senderUser.id} (${senderUser.email})\n`);

    // Step 2: Create recipient user
    console.log('Step 2: Creating recipient user...');
    const recipientId = crypto.randomUUID();
    const recipientEmail = `recipient-${Date.now()}@example.com`;
    
    const [recipientUser] = await db.insert(user)
      .values({
        id: recipientId,
        name: 'Recipient User',
        email: recipientEmail,
        emailVerified: false,
      })
      .returning();
    
    createdUserIds.push(recipientUser.id);
    console.log(`Recipient created: ${recipientUser.id} (${recipientUser.email})\n`);

    // Step 3: Create a streak
    console.log('Step 3: Creating streak...');
    const streakData = {
      title: 'Partner Accountability Test',
      description: 'Testing complete invitation flow',
      category: 'fitness',
      type: 'duo' as const,
      maxParticipants: 2,
      timezone: 'UTC',
    };
    
    const newStreak = await streakService.createStreak({
      ...streakData,
      creatorId: senderUser.id,
    });
    
    createdStreakId = newStreak.id;
    console.log(`Streak created: ${newStreak.id}\n`);

    // Step 4: Send invitation
    console.log('Step 4: Sending invitation...');
    const invitation = await streakService.sendInvitation({
      streakId: newStreak.id,
      senderId: senderUser.id,
      recipientEmail: recipientUser.email,
      message: 'Join me for daily fitness!',
    });
    
    console.log(`✅ Invitation sent successfully!`);
    console.log(`Token: ${invitation.token}\n`);

    // Step 5: Accept invitation
    console.log('Step 5: Accepting invitation...');
    try {
      const acceptedStreak = await streakService.acceptInvitation(
        invitation.token,
        recipientUser.id
      );
      
      console.log('✅ INVITATION ACCEPTED SUCCESSFULLY!');
      console.log(`Streak title: ${acceptedStreak.title}\n`);
      
      // Step 6: Verify both users are participants
      console.log('Step 6: Verifying both users are participants...');
      const allParticipants = await db.query.streakParticipants.findMany({
        where: eq(streakParticipants.streakId, newStreak.id),
      });
      
      console.log(`Total participants: ${allParticipants.length}`);
      allParticipants.forEach(p => {
        const userName = p.userId === senderUser.id ? 'Sender' : 'Recipient';
        console.log(`  - ${userName}: Role=${p.role}, Active=${p.isActive}`);
      });
      
      if (allParticipants.length === 2) {
        console.log('\n✅ PARTNERS SUCCESSFULLY LINKED TO STREAK!');
      } else {
        console.log('\n❌ Expected 2 participants, found:', allParticipants.length);
      }
      
      // Step 7: Verify invitation status
      const updatedInvitation = await db.query.invitations.findFirst({
        where: eq(invitations.id, invitation.id),
      });
      
      console.log(`\nInvitation status: ${updatedInvitation?.status}`);
      if (updatedInvitation?.status === 'accepted') {
        console.log('✅ Invitation status correctly updated to accepted');
      }
      
      // Step 8: Test that duplicate acceptance fails
      console.log('\nStep 8: Testing duplicate acceptance prevention...');
      try {
        await streakService.acceptInvitation(
          invitation.token,
          recipientUser.id
        );
        console.log('❌ Duplicate acceptance should have failed!');
      } catch (error) {
        if (error instanceof Error && error.message.includes('already been processed')) {
          console.log('✅ Duplicate acceptance correctly prevented');
        } else {
          console.log('❌ Unexpected error:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ ACCEPTANCE FAILED:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Cleanup
    console.log('\nCleaning up test data...');
    if (createdStreakId) {
      await db.delete(invitations).where(eq(invitations.streakId, createdStreakId));
      await db.delete(streakParticipants).where(eq(streakParticipants.streakId, createdStreakId));
      await db.delete(streaks).where(eq(streaks.id, createdStreakId));
    }
    for (const userId of createdUserIds) {
      await db.delete(user).where(eq(user.id, userId));
    }
    console.log('Test data cleaned up');
    process.exit(0);
  }
}

// Run the test
testAcceptanceFlow();