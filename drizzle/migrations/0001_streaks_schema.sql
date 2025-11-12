-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create streaks table
CREATE TABLE IF NOT EXISTS "streaks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL DEFAULT 'general',
	"created_by" text NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"type" text NOT NULL DEFAULT 'duo',
	"max_participants" integer NOT NULL DEFAULT 2,
	"timezone" text NOT NULL DEFAULT 'UTC',
	"reminder_time" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create streak_participants table
CREATE TABLE IF NOT EXISTS "streak_participants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"streak_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL DEFAULT 'participant',
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "unique_streak_user" PRIMARY KEY("streak_id","user_id")
);

-- Create check_ins table
CREATE TABLE IF NOT EXISTS "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"streak_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"check_in_date" text NOT NULL,
	"proof_text" text,
	"proof_image_url" text,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	CONSTRAINT "unique_streak_user_date" PRIMARY KEY("streak_id","user_id","check_in_date")
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS "invitations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"streak_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_email" text NOT NULL,
	"recipient_user_id" text,
	"token" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"message" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "streaks_created_by_idx" ON "streaks" ("created_by");
CREATE INDEX IF NOT EXISTS "streaks_status_idx" ON "streaks" ("status");
CREATE INDEX IF NOT EXISTS "streak_participants_streak_id_idx" ON "streak_participants" ("streak_id");
CREATE INDEX IF NOT EXISTS "streak_participants_user_id_idx" ON "streak_participants" ("user_id");
CREATE INDEX IF NOT EXISTS "check_ins_streak_id_idx" ON "check_ins" ("streak_id");
CREATE INDEX IF NOT EXISTS "check_ins_user_id_idx" ON "check_ins" ("user_id");
CREATE INDEX IF NOT EXISTS "check_ins_date_idx" ON "check_ins" ("check_in_date");
CREATE INDEX IF NOT EXISTS "invitations_streak_id_idx" ON "invitations" ("streak_id");
CREATE INDEX IF NOT EXISTS "invitations_sender_id_idx" ON "invitations" ("sender_id");
CREATE INDEX IF NOT EXISTS "invitations_token_idx" ON "invitations" ("token");
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" ("recipient_email");

-- Add foreign key constraints
DO $$ BEGIN
	ALTER TABLE "streaks" ADD CONSTRAINT "streaks_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "streak_participants" ADD CONSTRAINT "streak_participants_streak_id_streaks_id_fk" FOREIGN KEY ("streak_id") REFERENCES "streaks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "streak_participants" ADD CONSTRAINT "streak_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_streak_id_streaks_id_fk" FOREIGN KEY ("streak_id") REFERENCES "streaks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "invitations" ADD CONSTRAINT "invitations_streak_id_streaks_id_fk" FOREIGN KEY ("streak_id") REFERENCES "streaks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "invitations" ADD CONSTRAINT "invitations_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "invitations" ADD CONSTRAINT "invitations_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;