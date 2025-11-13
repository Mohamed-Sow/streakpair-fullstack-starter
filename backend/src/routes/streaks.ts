import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  type GetStreaksResponse,
  type CreateStreakResponse,
  createStreakRequestSchema,
  type JoinStreakResponse,
  joinStreakRequestSchema,
  type CreateCheckInResponse,
  createCheckInRequestSchema,
  type GetStreakDetailsResponse,
} from "@/shared/contracts";
import { type AppType } from "../types";
import { db } from "../db";

const streaksRouter = new Hono<AppType>();

// ============================================
// GET /api/streaks - Get all user's streaks
// ============================================
streaksRouter.get("/", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  console.log(`📊 [Streaks] Fetching streaks for user: ${user.id}`);

  try {
    const streaks = await db.streak.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        checkIns: {
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ [Streaks] Found ${streaks.length} streaks`);

    // Transform dates to ISO strings
    const transformedStreaks = streaks.map((streak) => ({
      ...streak,
      startDate: streak.startDate.toISOString(),
      endDate: streak.endDate?.toISOString() || null,
      createdAt: streak.createdAt.toISOString(),
      updatedAt: streak.updatedAt.toISOString(),
      members: streak.members.map((member) => ({
        ...member,
        joinedAt: member.joinedAt.toISOString(),
      })),
      checkIns: streak.checkIns.map((checkIn) => ({
        ...checkIn,
        createdAt: checkIn.createdAt.toISOString(),
      })),
    }));

    return c.json({ streaks: transformedStreaks } satisfies GetStreaksResponse);
  } catch (error) {
    console.error("❌ [Streaks] Error fetching streaks:", error);
    return c.json({ message: "Failed to fetch streaks" }, 500);
  }
});

// ============================================
// POST /api/streaks - Create a new streak
// ============================================
streaksRouter.post("/", zValidator("json", createStreakRequestSchema), async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const {
    name,
    description,
    emoji,
    frequency,
    isCompetition,
    competitionType,
    endDate,
    stakesPerPerson,
    punishment,
    customPunishment,
  } = c.req.valid("json");
  console.log(`🔥 [Streaks] Creating new streak "${name}" for user: ${user.id}`);

  try {
    // Calculate reward pool (will be updated as more members join)
    const rewardPool = isCompetition ? stakesPerPerson : 0;

    const streak = await db.streak.create({
      data: {
        name,
        description: description || null,
        emoji: emoji || null,
        frequency,
        createdBy: user.id,
        isCompetition: isCompetition || false,
        competitionType: competitionType || null,
        endDate: endDate ? new Date(endDate) : null,
        rewardPool,
        stakesPerPerson: stakesPerPerson || 0,
        punishment: punishment || null,
        customPunishment: customPunishment || null,
        members: {
          create: {
            userId: user.id,
            role: "creator",
          },
        },
      },
    });

    console.log(`✅ [Streaks] Created streak: ${streak.id}`);

    return c.json({
      success: true,
      streak: {
        id: streak.id,
        name: streak.name,
        description: streak.description,
        emoji: streak.emoji,
        frequency: streak.frequency,
        startDate: streak.startDate.toISOString(),
        inviteCode: streak.inviteCode,
        isCompetition: streak.isCompetition,
        competitionType: streak.competitionType,
        endDate: streak.endDate?.toISOString() || null,
        rewardPool: streak.rewardPool,
        stakesPerPerson: streak.stakesPerPerson,
        punishment: streak.punishment,
        customPunishment: streak.customPunishment,
      },
    } satisfies CreateStreakResponse);
  } catch (error) {
    console.error("❌ [Streaks] Error creating streak:", error);
    return c.json({ message: "Failed to create streak" }, 500);
  }
});

// ============================================
// POST /api/streaks/join - Join a streak via invite code
// ============================================
streaksRouter.post("/join", zValidator("json", joinStreakRequestSchema), async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const { inviteCode } = c.req.valid("json");
  console.log(`👥 [Streaks] User ${user.id} attempting to join streak with code: ${inviteCode}`);

  try {
    const streak = await db.streak.findUnique({
      where: { inviteCode },
      include: {
        members: true,
      },
    });

    if (!streak) {
      console.log(`❌ [Streaks] Streak not found with code: ${inviteCode}`);
      return c.json({
        success: false,
        message: "Invalid invite code",
        streak: null,
      } satisfies JoinStreakResponse);
    }

    if (!streak.isActive) {
      console.log(`❌ [Streaks] Streak ${streak.id} is not active`);
      return c.json({
        success: false,
        message: "This streak is no longer active",
        streak: null,
      } satisfies JoinStreakResponse);
    }

    // Check if user is already a member
    const existingMember = streak.members.find((m) => m.userId === user.id);
    if (existingMember) {
      console.log(`⚠️  [Streaks] User ${user.id} is already a member of streak ${streak.id}`);
      return c.json({
        success: false,
        message: "You are already a member of this streak",
        streak: null,
      } satisfies JoinStreakResponse);
    }

    // Add user to streak
    await db.streakMember.create({
      data: {
        streakId: streak.id,
        userId: user.id,
        role: "member",
      },
    });

    // If it's a competition, update the reward pool
    if (streak.isCompetition && streak.stakesPerPerson > 0) {
      const newRewardPool = streak.rewardPool + streak.stakesPerPerson;
      await db.streak.update({
        where: { id: streak.id },
        data: { rewardPool: newRewardPool },
      });
      console.log(`💰 [Streaks] Updated reward pool to ${newRewardPool} for streak ${streak.id}`);
    }

    console.log(`✅ [Streaks] User ${user.id} joined streak ${streak.id}`);

    return c.json({
      success: true,
      message: "Successfully joined streak!",
      streak: {
        id: streak.id,
        name: streak.name,
        description: streak.description,
        emoji: streak.emoji,
      },
    } satisfies JoinStreakResponse);
  } catch (error) {
    console.error("❌ [Streaks] Error joining streak:", error);
    return c.json({
      success: false,
      message: "Failed to join streak",
      streak: null,
    } satisfies JoinStreakResponse);
  }
});

// ============================================
// GET /api/streaks/:streakId - Get streak details
// ============================================
streaksRouter.get("/:streakId", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const streakId = c.req.param("streakId");
  console.log(`📊 [Streaks] Fetching details for streak: ${streakId}`);

  try {
    const streak = await db.streak.findUnique({
      where: { id: streakId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        checkIns: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!streak) {
      console.log(`❌ [Streaks] Streak not found: ${streakId}`);
      return c.json({
        success: false,
        streak: null,
      } satisfies GetStreakDetailsResponse);
    }

    // Check if user is a member
    const isMember = streak.members.some((m) => m.userId === user.id);
    if (!isMember) {
      console.log(`❌ [Streaks] User ${user.id} is not a member of streak ${streakId}`);
      return c.json({ message: "Unauthorized" }, 401);
    }

    console.log(`✅ [Streaks] Found streak: ${streak.id}`);

    return c.json({
      success: true,
      streak: {
        ...streak,
        startDate: streak.startDate.toISOString(),
        endDate: streak.endDate?.toISOString() || null,
        members: streak.members.map((member) => ({
          ...member,
          joinedAt: member.joinedAt.toISOString(),
        })),
        checkIns: streak.checkIns.map((checkIn) => ({
          ...checkIn,
          createdAt: checkIn.createdAt.toISOString(),
        })),
      },
    } satisfies GetStreakDetailsResponse);
  } catch (error) {
    console.error("❌ [Streaks] Error fetching streak details:", error);
    return c.json({
      success: false,
      streak: null,
    } satisfies GetStreakDetailsResponse);
  }
});

// ============================================
// POST /api/streaks/:streakId/check-in - Create a check-in
// ============================================
streaksRouter.post("/:streakId/check-in", zValidator("json", createCheckInRequestSchema), async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const streakId = c.req.param("streakId");
  const { date, photoUrl, note } = c.req.valid("json");
  console.log(`✅ [Check-in] Creating check-in for streak ${streakId}, date: ${date}`);

  try {
    // Verify user is a member of the streak
    const member = await db.streakMember.findUnique({
      where: {
        streakId_userId: {
          streakId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      console.log(`❌ [Check-in] User ${user.id} is not a member of streak ${streakId}`);
      return c.json({
        success: false,
        message: "You are not a member of this streak",
        checkIn: null,
      } satisfies CreateCheckInResponse);
    }

    // Check if user already checked in for this date
    const existingCheckIn = await db.checkIn.findUnique({
      where: {
        streakId_userId_date: {
          streakId,
          userId: user.id,
          date,
        },
      },
    });

    if (existingCheckIn) {
      console.log(`⚠️  [Check-in] User ${user.id} already checked in for ${date}`);
      return c.json({
        success: false,
        message: "You have already checked in for this date",
        checkIn: null,
      } satisfies CreateCheckInResponse);
    }

    // Create check-in
    const checkIn = await db.checkIn.create({
      data: {
        streakId,
        userId: user.id,
        date,
        photoUrl: photoUrl || null,
        note: note || null,
      },
    });

    console.log(`✅ [Check-in] Created check-in: ${checkIn.id}`);

    return c.json({
      success: true,
      message: "Check-in successful!",
      checkIn: {
        id: checkIn.id,
        date: checkIn.date,
        photoUrl: checkIn.photoUrl,
        note: checkIn.note,
        createdAt: checkIn.createdAt.toISOString(),
      },
    } satisfies CreateCheckInResponse);
  } catch (error) {
    console.error("❌ [Check-in] Error creating check-in:", error);
    return c.json({
      success: false,
      message: "Failed to create check-in",
      checkIn: null,
    } satisfies CreateCheckInResponse);
  }
});

export { streaksRouter };
