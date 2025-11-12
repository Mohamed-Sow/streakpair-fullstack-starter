import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    boolean,
    index,
    primaryKey,
    uniqueIndex
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const streaks = pgTable("streaks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("general"),
    createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"), // active, paused, completed
    type: text("type").notNull().default("duo"), // duo, squad, tribe
    maxParticipants: integer("max_participants").notNull().default(2),
    timezone: text("timezone").notNull().default("UTC"),
    reminderTime: text("reminder_time"), // HH:mm format
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
    createdByIdx: index("streaks_created_by_idx").on(table.createdBy),
    statusIdx: index("streaks_status_idx").on(table.status),
}));

export const streakParticipants = pgTable("streak_participants", {
    id: uuid("id").primaryKey().defaultRandom(),
    streakId: uuid("streak_id").notNull().references(() => streaks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("participant"), // owner, participant
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
    streakIdIdx: index("streak_participants_streak_id_idx").on(table.streakId),
    userIdIdx: index("streak_participants_user_id_idx").on(table.userId),
    uniqueStreakUser: uniqueIndex("unique_streak_user_idx").on(table.streakId, table.userId),
}));

export const checkIns = pgTable("check_ins", {
    id: uuid("id").primaryKey().defaultRandom(),
    streakId: uuid("streak_id").notNull().references(() => streaks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    checkInDate: text("check_in_date").notNull(), // YYYY-MM-DD format for easy comparison
    proofText: text("proof_text"),
    proofImageUrl: text("proof_image_url"),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
    verified: boolean("verified").notNull().default(false),
    verifiedAt: timestamp("verified_at"),
    verifiedBy: text("verified_by").references(() => user.id),
}, (table) => ({
    streakIdIdx: index("check_ins_streak_id_idx").on(table.streakId),
    userIdIdx: index("check_ins_user_id_idx").on(table.userId),
    dateIdx: index("check_ins_date_idx").on(table.checkInDate),
    uniqueStreakUserDate: uniqueIndex("unique_streak_user_date_idx").on(table.streakId, table.userId, table.checkInDate),
}));

export const invitations = pgTable("invitations", {
    id: uuid("id").primaryKey().defaultRandom(),
    streakId: uuid("streak_id").notNull().references(() => streaks.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    recipientEmail: text("recipient_email").notNull(),
    recipientUserId: text("recipient_user_id").references(() => user.id, { onDelete: "set null" }),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // pending, accepted, declined, expired
    message: text("message"),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    declinedAt: timestamp("declined_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    streakIdIdx: index("invitations_streak_id_idx").on(table.streakId),
    senderIdIdx: index("invitations_sender_id_idx").on(table.senderId),
    tokenIdx: index("invitations_token_idx").on(table.token),
    emailIdx: index("invitations_email_idx").on(table.recipientEmail),
}));

// Relations
export const streaksRelations = relations(streaks, ({ many, one }) => ({
    participants: many(streakParticipants),
    checkIns: many(checkIns),
    invitations: many(invitations),
    creator: one(user, {
        fields: [streaks.createdBy],
        references: [user.id],
    }),
}));

export const streakParticipantsRelations = relations(streakParticipants, ({ one }) => ({
    streak: one(streaks, {
        fields: [streakParticipants.streakId],
        references: [streaks.id],
    }),
    user: one(user, {
        fields: [streakParticipants.userId],
        references: [user.id],
    }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
    streak: one(streaks, {
        fields: [checkIns.streakId],
        references: [streaks.id],
    }),
    user: one(user, {
        fields: [checkIns.userId],
        references: [user.id],
    }),
    verifier: one(user, {
        fields: [checkIns.verifiedBy],
        references: [user.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    streak: one(streaks, {
        fields: [invitations.streakId],
        references: [streaks.id],
    }),
    sender: one(user, {
        fields: [invitations.senderId],
        references: [user.id],
    }),
    recipient: one(user, {
        fields: [invitations.recipientUserId],
        references: [user.id],
    }),
}));

// Types
export type Streak = typeof streaks.$inferSelect;
export type NewStreak = typeof streaks.$inferInsert;
export type StreakParticipant = typeof streakParticipants.$inferSelect;
export type NewStreakParticipant = typeof streakParticipants.$inferInsert;
export type CheckIn = typeof checkIns.$inferSelect;
export type NewCheckIn = typeof checkIns.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;