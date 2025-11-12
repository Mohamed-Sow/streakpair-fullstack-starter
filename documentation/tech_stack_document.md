# Tech Stack Document for StreakPair

This document explains the technology choices behind the **StreakPair** social accountability app in plain language. It shows how each part of the stack fits together to deliver a fast, reliable, and secure experience for users.

## 1. Frontend Technologies

The frontend is everything the user sees and interacts with in their browser or on their phone. We chose tools that make it easy to build a polished, responsive, and accessible interface.

- **Next.js (App Router)**  
  A modern web framework that handles page routing, server-side rendering, and API routes all in one place. It helps us load pages quickly and serve up fresh data when users need it.

- **TypeScript**  
  A version of JavaScript with built-in checks for common coding mistakes. It gives us confidence that components and data structures (like users, streaks, and payments) fit together correctly.

- **Tailwind CSS v4**  
  A utility-first styling tool that lets us build a responsive, mobile-first design with pre-defined classes. It speeds up development and keeps our styles consistent.

- **shadcn/ui**  
  A library of ready-made, accessible React components (buttons, forms, cards, tables). We use these building blocks to create a polished user interface without recreating common elements from scratch.

- **next-themes**  
  A simple way to offer dark mode and light mode toggles. Users can pick their preferred theme, and the app remembers their choice.

## 2. Backend Technologies

The backend powers the app’s logic, data, and security. It handles user accounts, streak tracking, payments, and more behind the scenes.

- **Node.js & Next.js API Routes**  
  Our server code runs on Node.js and lives alongside the frontend in Next.js API routes. This lets us write server logic (check-in validation, payment webhooks) in the same codebase as our pages.

- **Better Auth (Email/Password)**  
  Provides secure, out-of-the-box user registration, login, password reset, and session management. We can extend it to add social logins (Google, Apple) later.

- **Drizzle ORM & PostgreSQL**  
  - *PostgreSQL*: A reliable, open-source database to store users, streaks, groups, check-ins, and payment records.  
  - *Drizzle ORM*: A type-safe tool that lets us define our database structure in code and run queries confidently.

- **Utility Libraries**  
  - `cn` helper: Simplifies combining Tailwind classes based on component state.  
  - Custom `streak-logic` module: Houses core business rules (when a streak breaks, how to calculate progress).

## 3. Infrastructure and Deployment

These choices ensure the app is easy to deploy, update, and scale as more users join.

- **Version Control (Git + GitHub)**  
  We store all code in GitHub for collaboration, code reviews, and history tracking.

- **Containerization (Docker & Docker Compose)**  
  Encapsulates our database and local services so every developer works in the same environment. No more “it works on my machine” surprises.

- **Hosting Platform (Vercel or any Docker-friendly host)**  
  Deploys the Next.js app globally, serving pages from the closest server to each user. We can also choose services like AWS ECS, Heroku, or DigitalOcean.

- **CI/CD Pipeline (GitHub Actions)**  
  - Automatically runs tests and code linters on each code change.  
  - Builds and deploys the app when updates are merged, ensuring a consistent release process.

## 4. Third-Party Integrations

These services extend the app’s core capabilities without reinventing the wheel.

- **Stripe**  
  Handles subscription billing and one-time payments. We use secure webhooks to track successful charges and cancellations.

- **Twilio**  
  Sends SMS reminders for daily check-ins and upcoming streak deadlines. Users opt-in and manage their phone settings in the app.

- **Real-Time Updates (Pusher or Ably)**  
  Powers live notifications when a partner checks in, boosting engagement by showing instant feedback.

- **Analytics (PostHog, Mixpanel, or Vercel Analytics)**  
  Tracks user behavior—like streak completion rates and feature usage—to inform product decisions and measure growth.

## 5. Security and Performance Considerations

We’ve built in layers of security and optimized performance to keep data safe and users happy.

- **Authentication & Authorization**  
  - Secure email/password handling with hashed passwords and session cookies.  
  - Plans to add OAuth (Google, Apple) for one-click sign-in.

- **Data Protection**  
  - Environment variables for secret keys (Stripe, Twilio).  
  - HTTPS by default on production to encrypt data in transit.

- **Error Handling & Feedback**  
  - Consistent error responses from API routes.  
  - User-friendly toast notifications for successes and failures (payments, check-ins).

- **Performance Optimizations**  
  - Server Components in Next.js fetch data on the server, reducing bundle size and speeding up page loads.  
  - Tailwind’s utility classes and tree-shaking ensure CSS bundles stay small.  
  - Database indexing on key fields (user IDs, timestamps) for fast lookups.

- **Testing Strategy**  
  - *Unit Tests*: Jest or Vitest for core business logic (streak rules, date handling).  
  - *Component Tests*: React Testing Library for UI elements.  
  - *End-to-End Tests*: Playwright or Cypress to simulate user flows (sign-up, check-in, payment).

## 6. Conclusion and Overall Tech Stack Summary

StreakPair’s foundation leverages a modern, full-stack template that:

- Delivers a **fast, responsive user interface** using Next.js, React components, and Tailwind CSS.  
- Provides **robust backend services** with TypeScript, Drizzle ORM/MySQL, and secure authentication out of the box.  
- Ensures **reliable deployments** and developer consistency through Docker, GitHub Actions, and container-friendly hosting.  
- Integrates critical features like **payments (Stripe)**, **notifications (Twilio, Pusher)**, and **analytics** without extra overhead.

This combination accelerates development while maintaining high quality, security, and scalability—perfect for launching and growing the StreakPair social accountability app.