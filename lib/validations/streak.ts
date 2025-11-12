import { z } from 'zod';

export const createStreakSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  category: z.string().default('general'),
  type: z.enum(['duo', 'squad', 'tribe']).default('duo'),
  maxParticipants: z.number().int().min(2).max(15).default(2),
  timezone: z.string().default('UTC'),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format, use HH:mm').optional(),
});

export const sendInvitationSchema = z.object({
  streakId: z.string().uuid('Invalid streak ID'),
  recipientEmail: z.string().email('Invalid email address'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

export const checkInSchema = z.object({
  proofText: z.string().max(1000, 'Proof text must be less than 1000 characters').optional(),
  proofImageUrl: z.string().url('Invalid image URL').optional(),
}).refine(
  (data) => data.proofText || data.proofImageUrl,
  {
    message: 'Either proof text or proof image URL is required',
    path: ['proofText'],
  }
);

export type CreateStreakInput = z.infer<typeof createStreakSchema>;
export type SendInvitationInput = z.infer<typeof sendInvitationSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;