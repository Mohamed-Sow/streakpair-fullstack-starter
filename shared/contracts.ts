// contracts.ts
// Shared API contracts (schemas and types) used by both the server and the app.
// Import in the app as: `import { type GetSampleResponse } from "@shared/contracts"`
// Import in the server as: `import { postSampleRequestSchema } from "@shared/contracts"`

import { z } from "zod";

// GET /api/sample
export const getSampleResponseSchema = z.object({
  message: z.string(),
});
export type GetSampleResponse = z.infer<typeof getSampleResponseSchema>;

// POST /api/sample
export const postSampleRequestSchema = z.object({
  value: z.string(),
});
export type PostSampleRequest = z.infer<typeof postSampleRequestSchema>;
export const postSampleResponseSchema = z.object({
  message: z.string(),
});
export type PostSampleResponse = z.infer<typeof postSampleResponseSchema>;

// POST /api/upload/image
export const uploadImageRequestSchema = z.object({
  image: z.instanceof(File),
});
export type UploadImageRequest = z.infer<typeof uploadImageRequestSchema>;
export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string(),
  filename: z.string(),
});
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// ============================================
// Streak API Contracts
// ============================================

// GET /api/streaks - Get all user's streaks
export const getStreaksResponseSchema = z.object({
  streaks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      emoji: z.string().nullable(),
      frequency: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      createdBy: z.string(),
      inviteCode: z.string(),
      isActive: z.boolean(),
      isCompetition: z.boolean(),
      competitionType: z.string().nullable(),
      rewardPool: z.number(),
      stakesPerPerson: z.number(),
      punishment: z.string().nullable(),
      customPunishment: z.string().nullable(),
      createdAt: z.string(),
      members: z.array(
        z.object({
          id: z.string(),
          userId: z.string(),
          role: z.string(),
          joinedAt: z.string(),
          user: z.object({
            id: z.string(),
            name: z.string().nullable(),
            email: z.string(),
            image: z.string().nullable(),
          }),
        })
      ),
      checkIns: z.array(
        z.object({
          id: z.string(),
          date: z.string(),
          userId: z.string(),
          photoUrl: z.string().nullable(),
          note: z.string().nullable(),
          createdAt: z.string(),
        })
      ),
    })
  ),
});
export type GetStreaksResponse = z.infer<typeof getStreaksResponseSchema>;

// POST /api/streaks - Create a new streak
export const createStreakRequestSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  emoji: z.string().optional(),
  frequency: z.string().default("daily"),
  // Competition features
  isCompetition: z.boolean().default(false),
  competitionType: z.enum(["duo", "team", "ffa"]).optional(),
  endDate: z.string().optional(), // ISO date string
  stakesPerPerson: z.number().min(0).default(0),
  punishment: z.enum(["monetary", "none", "custom"]).optional(),
  customPunishment: z.string().max(200).optional(),
});
export type CreateStreakRequest = z.infer<typeof createStreakRequestSchema>;
export const createStreakResponseSchema = z.object({
  success: z.boolean(),
  streak: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    emoji: z.string().nullable(),
    frequency: z.string(),
    startDate: z.string(),
    inviteCode: z.string(),
    isCompetition: z.boolean(),
    competitionType: z.string().nullable(),
    endDate: z.string().nullable(),
    rewardPool: z.number(),
    stakesPerPerson: z.number(),
    punishment: z.string().nullable(),
    customPunishment: z.string().nullable(),
  }),
});
export type CreateStreakResponse = z.infer<typeof createStreakResponseSchema>;

// POST /api/streaks/join - Join a streak via invite code
export const joinStreakRequestSchema = z.object({
  inviteCode: z.string().min(1),
});
export type JoinStreakRequest = z.infer<typeof joinStreakRequestSchema>;
export const joinStreakResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  streak: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      emoji: z.string().nullable(),
    })
    .nullable(),
});
export type JoinStreakResponse = z.infer<typeof joinStreakResponseSchema>;

// POST /api/streaks/:streakId/check-in - Create a check-in
export const createCheckInRequestSchema = z.object({
  date: z.string(), // YYYY-MM-DD format
  photoUrl: z.string().optional(),
  note: z.string().max(500).optional(),
});
export type CreateCheckInRequest = z.infer<typeof createCheckInRequestSchema>;
export const createCheckInResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  checkIn: z
    .object({
      id: z.string(),
      date: z.string(),
      photoUrl: z.string().nullable(),
      note: z.string().nullable(),
      createdAt: z.string(),
    })
    .nullable(),
});
export type CreateCheckInResponse = z.infer<typeof createCheckInResponseSchema>;

// GET /api/streaks/:streakId - Get streak details
export const getStreakDetailsResponseSchema = z.object({
  success: z.boolean(),
  streak: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      emoji: z.string().nullable(),
      frequency: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      inviteCode: z.string(),
      isActive: z.boolean(),
      isCompetition: z.boolean(),
      competitionType: z.string().nullable(),
      rewardPool: z.number(),
      stakesPerPerson: z.number(),
      punishment: z.string().nullable(),
      customPunishment: z.string().nullable(),
      members: z.array(
        z.object({
          id: z.string(),
          userId: z.string(),
          role: z.string(),
          joinedAt: z.string(),
          user: z.object({
            id: z.string(),
            name: z.string().nullable(),
            email: z.string(),
            image: z.string().nullable(),
          }),
        })
      ),
      checkIns: z.array(
        z.object({
          id: z.string(),
          date: z.string(),
          userId: z.string(),
          photoUrl: z.string().nullable(),
          note: z.string().nullable(),
          createdAt: z.string(),
          user: z.object({
            id: z.string(),
            name: z.string().nullable(),
            email: z.string(),
            image: z.string().nullable(),
          }),
        })
      ),
    })
    .nullable(),
});
export type GetStreakDetailsResponse = z.infer<typeof getStreakDetailsResponseSchema>;
