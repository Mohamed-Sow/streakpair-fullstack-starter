# Backend Structure Document for StreakPair Social Accountability App

This document outlines the backend architecture, database design, API endpoints, hosting setup, infrastructure components, security measures, and operational practices for the StreakPair application. It’s written in everyday language so everyone on the team can understand how the backend is organized and why each choice was made.

## 1. Backend Architecture

### Overview
- We use Next.js (App Router) as our server framework. It handles both front-end pages and backend API routes in one codebase.  
- Language: TypeScript, for catching errors early and making the code easier to maintain.  
- We follow a service-oriented pattern: API routes call service functions, services call the database via Drizzle ORM.  

### Key Benefits
- Scalability: Serverless or containerized Next.js endpoints can scale independently based on traffic.  
- Maintainability: Type-safe services and clear folder structure—`/app/api`, `/lib/services`, `/db`—keep code organized.  
- Performance: Server Components in Next.js fetch data on the server, reducing bundle size on the client.  

## 2. Database Management

### Technology Stack
- SQL database: PostgreSQL hosted on AWS RDS.  
- ORM: Drizzle ORM, a type-safe library that maps TypeScript types to database tables.  

### Data Practices
- Structured data: All core entities (users, streaks, groups, etc.) live in relational tables.  
- Migrations: We track schema changes in version-controlled migration scripts.  
- Indexes: We add indexes on foreign keys and frequently queried fields (e.g., `userId`, `streakId`).  
- Backups: Automated daily backups via RDS snapshots.  

## 3. Database Schema

Below is a human-readable description of the main tables, followed by SQL definitions.

### Tables and Relationships (Human-Readable)
- **users**: Stores each person’s login info and profile.  
- **streaks**: Defines a paired streak or group streak.  
- **streak_participants**: Links users to streaks, recording join date and role.  
- **check_ins**: Logs each daily check-in by a user for a streak.  
- **groups**: (Optional) Defines larger groups like squads or tribes.  
- **group_members**: Links users to groups.  
- **subscriptions**: Tracks a user’s Stripe subscription status.  
- **payments**: Records individual payment events tied to subscriptions.  

### SQL Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  name             TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Streaks table
CREATE TABLE streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  created_by       UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Streak participants
CREATE TABLE streak_participants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_id        UUID REFERENCES streaks(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT    -- e.g., "owner" or "partner"
);

-- Daily check-ins
CREATE TABLE check_ins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streak_id        UUID REFERENCES streaks(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  check_in_date    DATE NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Groups (squads/tribes)
CREATE TABLE groups (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  type             TEXT CHECK (type IN ('squad','tribe')) NOT NULL,
  created_by       UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Group members
CREATE TABLE group_members (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT    -- e.g., "member", "admin"
);

-- Subscriptions (Stripe)
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription  TEXT UNIQUE NOT NULL,
  status               TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end   TIMESTAMP WITH TIME ZONE
);

-- Payment events
CREATE TABLE payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id      UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount               NUMERIC(10,2) NOT NULL,
  currency             TEXT NOT NULL,
  status               TEXT NOT NULL,
  payment_date         TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 4. API Design and Endpoints

We use RESTful API routes under `/app/api`. Each route lives in its own folder in Next.js App Router.

### Authentication (Better Auth)
- `POST /api/auth/email/send` — Send magic link to user’s email.  
- `POST /api/auth/email/verify` — Verify link and create session.  

### Streak Management
- `GET /api/streaks` — List all streaks for the logged-in user.  
- `POST /api/streaks` — Create a new streak.  
- `GET /api/streaks/[streakId]` — Get details of a single streak.  
- `PUT /api/streaks/[streakId]` — Update streak metadata.  
- `DELETE /api/streaks/[streakId]` — Remove a streak.  

### Daily Check-Ins
- `POST /api/streaks/[streakId]/checkin` — Log today’s check-in for the user.  
- `GET /api/streaks/[streakId]/checkins` — Fetch check-in history.  

### Group Collaboration
- `GET /api/groups` — List user’s groups.  
- `POST /api/groups` — Create a squad or tribe.  
- `POST /api/groups/[groupId]/members` — Invite or add a member.  
- `DELETE /api/groups/[groupId]/members/[memberId]` — Remove a member.  

### Monetization (Stripe)
- `POST /api/stripe/create-subscription` — Initialize a Stripe checkout session.  
- `POST /api/webhooks/stripe` — Handle incoming Stripe events (payments, cancellations).  

## 5. Hosting Solutions

We host our backend on AWS using these services:
- **AWS ECS Fargate**: Runs Dockerized Next.js containers without managing servers.  
- **AWS RDS (PostgreSQL)**: Managed relational database with backups and replicas.  
- **Amazon S3 & CloudFront**: Static assets (images, fonts) are stored in S3 and distributed via CloudFront.  

Benefits:
- Reliability: AWS SLAs guarantee 99.9%+ uptime.  
- Scalability: Fargate auto-scales tasks based on CPU and memory.  
- Cost-effectiveness: You pay only for the resources you use.  

## 6. Infrastructure Components

- **Load Balancer (ALB)**: Distributes traffic across Fargate tasks for high availability.  
- **Content Delivery Network (CloudFront)**: Delivers static assets with low latency worldwide.  
- **Caching (ElastiCache Redis)**: Caches session and frequently accessed data (e.g., streak summaries) to reduce database load.  
- **Container Registry (ECR)**: Stores Docker images for our services.  
- **DNS (Route 53)**: Manages domain and SSL certificates.  

These components work together to ensure fast response times, high uptime, and a smooth user experience.

## 7. Security Measures

- **HTTPS Everywhere**: All traffic is encrypted in transit with SSL/TLS.  
- **Authentication & Authorization**: Better Auth for secure email link login; JWT tokens for session management; role checks in services.  
- **Password Storage**: Bcrypt-hashed passwords (where applicable).  
- **Environment Secrets**: Stored in AWS Secrets Manager and passed to containers at runtime.  
- **Data Encryption at Rest**: RDS and S3 buckets use AES-256 encryption.  
- **Stripe Webhook Signing**: Verify Stripe events using your endpoint secret.  
- **Input Validation**: All API inputs are validated to prevent injection attacks.  

## 8. Monitoring and Maintenance

### Monitoring Tools
- **AWS CloudWatch**: Collects logs, metrics, and custom alarms (CPU, memory, error rates).  
- **Sentry**: Captures and alerts on runtime exceptions and performance issues.  
- **Prometheus & Grafana** (optional): For custom dashboards and long-term metrics.  

### Maintenance Practices
- **Automated Backups**: Daily DB snapshots with point-in-time recovery.  
- **Schema Migrations**: Managed through versioned Drizzle scripts.  
- **CI/CD Pipeline**: GitHub Actions runs tests, builds Docker images, and deploys to AWS on each push to `main`.  
- **Regular Dependency Updates**: Automated Dependabot PRs for security patches.  

## 9. Conclusion and Overall Backend Summary

The StreakPair backend is built on a modern, scalable stack:
- Next.js with TypeScript and server-side components for fast, secure data fetching.  
- PostgreSQL managed by Drizzle ORM for type safety and predictable database interactions.  
- AWS infrastructure (ECS, RDS, S3, CloudFront) for reliability and cost efficiency.  

Key differentiators:
- Seamless server-client integration in Next.js App Router.  
- Type-safe database layer with migration support.  
- Containerized deployment on Fargate, eliminating server management.  
- Comprehensive monitoring and security practices.

This setup aligns tightly with StreakPair’s goals: empowering users to build and maintain shared streaks, delivering real-time engagement, and scaling reliably as the user base grows.