# StreakPair

## Overview
StreakPair is a social accountability web application that helps pairs (and eventually small groups) of users maintain daily habits together by sharing check-in streaks. The app leverages social pressure and positive reinforcement to boost long-term habit engagement - if one partner breaks the streak, both are reminded to stay on track.

## Current State
The project has been migrated from Vercel to Replit and is running successfully with:
- Next.js 15 with App Router
- PostgreSQL database (Replit-managed)
- Better Auth for authentication
- Drizzle ORM for type-safe database operations
- Tailwind CSS v4 + shadcn/ui components

## Key Features (v1 In Progress)
- Email/password authentication with verification
- Paired streak creation and invitation system
- Daily check-in tracking with proof submission
- Streak dashboard showing partner progress
- Subscription management (Stripe integration planned)

## Database Schema
The app uses the following main tables:
- **users**: User accounts with Better Auth
- **streaks**: Habit streaks with metadata (title, description, category, timezone)
- **streak_participants**: Links users to streaks with roles (owner/participant)
- **check_ins**: Daily check-in records with proof and verification
- **invitations**: Streak invitation system with tokens

## Environment Configuration
Required secrets (configured in Replit Secrets):
- `DATABASE_URL`: Automatically provided by Replit PostgreSQL
- `BETTER_AUTH_SECRET`: Secure random key for auth encryption
- `BETTER_AUTH_URL`: Your Replit deployment URL
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Same as BETTER_AUTH_URL (client-side)

## Development
- Dev server runs on port 5000 (configured for Replit)
- Database migrations: `npm run db:push`
- Database studio: `npm run db:studio`

## Recent Changes (Migration from Vercel)
- Updated port configuration to 5000 for Replit compatibility
- Fixed database schema circular dependencies
- Added unique constraints to prevent duplicate streak participants and check-ins
- Configured deployment for Replit autoscale

## Future Phases
- Group modes (squads, tribes)
- Real-time notifications
- SMS reminders via Twilio
- Analytics dashboard
- Mobile app
