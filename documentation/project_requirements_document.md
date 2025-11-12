# Project Requirements Document (PRD)

## 1. Project Overview

StreakPair is a social accountability web application that helps two (and later, small groups) of users maintain daily habits together by sharing check-in streaks. The core problem it solves is keeping people motivated through mutual encouragement—if one partner breaks the streak, both parties are reminded to stay on track. By making habit building a shared experience, StreakPair leverages social pressure and positive reinforcement to boost long-term engagement.

Building on the `streakpair-fullstack-starter`, StreakPair will provide user authentication, a clean dashboard for viewing and managing streaks, daily check-in workflows, and a subscription model for premium features. The key objectives for version 1 are: allow users to sign up with email/password, create a paired streak with a friend, perform daily check-ins, view streak progress, and manage a Stripe-based subscription. Success will be measured by low onboarding friction, high daily check-in rates, and seamless payment processing.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1)**
- Email/password authentication (Better Auth) with sign-up, sign-in, password reset, and email verification.
- User dashboard displaying active paired streaks, partner progress, and streak history.
- Daily check-in feature with validation and storage via Drizzle ORM/PostgreSQL.
- Invitation system for pairing two users into a streak.
- Basic subscription purchase and management using Stripe (subscription creation and webhook handling).
- Responsive UI components powered by Tailwind CSS, shadcn/ui, and next-themes for dark mode.
- Containerized local development environment (Docker, Docker Compose).

**Out-of-Scope (Future Phases)**
- Social OAuth login (Google, Apple).
- Group modes beyond pairs (squads, tribes).
- Real-time notifications via WebSockets or Pusher.
- SMS reminders with Twilio.
- Advanced analytics dashboard (Mixpanel, PostHog).
- Mobile app (React Native or SwiftUI).
- Multi-language or multi-region support.

## 3. User Flow

When a new user arrives, they land on a sign-up page where they enter an email and password. After verifying their email, they’re guided through a simple onboarding flow: choosing a habit title and inviting a friend by email. Once the friend accepts, both users share a paired streak. Upon acceptance, they’re redirected to the main dashboard.

On subsequent visits, the user signs in, lands on the dashboard with a sidebar for navigation (Dashboard, Profile, Subscription) and a main content area showing today’s streaks, partner status, and a history table. Each morning, they click a “Check-In” button to record progress. They can also manage their subscription in the settings, change their password, or log out. Email confirmations and simple toasts provide feedback throughout the flow.

## 4. Core Features

- **Authentication & Onboarding**: Email/password sign-up, sign-in, password reset, email verification.
- **Paired Streak Management**: Create a streak, send/accept invitation, paired progress tracking.
- **Daily Check-In API & UI**: Validate date, record check-in, prevent duplicate submissions.
- **Streak Dashboard**: Display active streaks, partner check-ins, completion calendar, history log.
- **Subscription Handling**: Stripe integration (checkout sessions, webhooks, subscription status).  
- **UI & Theming**: Responsive layout (mobile-first), dark mode support via next-themes, accessible components (WCAG AA).
- **Database Schema**: Drizzle ORM models for users, streaks, checkIns, subscriptions, invitations.
- **Development Environment**: Dockerized Postgres, environment variable management.

## 5. Tech Stack & Tools

- Frontend: Next.js (App Router), React, TypeScript
- Backend/API: Next.js API Routes, TypeScript
- Authentication: Better Auth (email/password)
- Database: PostgreSQL, Drizzle ORM
- Styling: Tailwind CSS v4, shadcn/ui component library, next-themes for theming
- Payments: Stripe SDK + Webhooks
- Containerization: Docker, Docker Compose
- CI/CD: GitHub Actions (lint, test, build, deploy)
- IDE & Plugins: VS Code, recommended extensions (ESLint, Prettier, Tailwind CSS IntelliSense)

## 6. Non-Functional Requirements

- **Performance**: API responses < 200 ms; initial page load < 1 s (on 3G).
- **Security & Compliance**: HTTPS everywhere; encrypt data at rest; OWASP Top 10 protection; GDPR-compliant data handling.
- **Reliability**: 99.9% uptime; retry logic for webhooks; idempotent API endpoints.
- **Accessibility**: WCAG AA; keyboard navigable; screen-reader friendly.
- **Usability**: Mobile-first responsive design; clear error messages; toast notifications for feedback.

## 7. Constraints & Assumptions

- PostgreSQL is the only supported database in v1.
- Stripe API keys and webhook URLs are available before shipping payment features.
- Docker must be installed on all development machines for consistency.
- Users have modern browsers that support ES modules and CSS variables.
- Timezone management assumes UTC storage with client-side conversion.

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Stripe webhooks and future SMS (Twilio) may hit rate limits—use exponential back-off and idempotency keys.
- **Race Conditions**: Simultaneous check-ins by both partners may cause conflicting writes—mitigate with database transactions.
- **Timezone Edge Cases**: Users across timezones might check in at different UTC dates—implement clear client-side cutoff logic.
- **Docker Performance**: Some macOS users see slow Docker volumes—recommend using Docker’s cached volume option.
- **Incomplete Error Handling**: Starter lacks global error boundary—add centralized error handler and user-friendly fallback pages.
- **Future Scaling**: WebSocket servers for real-time features need horizontal scaling planning—keep services loosely coupled for easy extraction.

---

This document captures the essential requirements for the first version of StreakPair, ensuring clarity and completeness for any AI or human engineer to proceed with technical design and implementation without ambiguity.