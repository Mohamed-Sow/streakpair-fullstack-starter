# Frontend Guideline Document

This document describes the frontend architecture, design principles, styling, component structure, and workflows for the **StreakPair** app based on the `streakpair-fullstack-starter` template. It is written in everyday language so anyone can understand how the frontend is built and maintained.

## 1. Frontend Architecture

### 1.1 Frameworks and Libraries
- **Next.js (App Router)**: Provides file-based routing, server components, and API routes. We use the App Router (`/app` folder) to separate server and client code naturally.
- **TypeScript**: Ensures type safety across components, pages, and API calls, reducing runtime errors.
- **React**: Powers our UI as a component-based library, letting us break the interface into reusable pieces.
- **Tailwind CSS v4**: A utility-first CSS framework for rapid, consistent styling.
- **shadcn/ui**: A set of prebuilt, accessible React components in a modern "New York" style for buttons, forms, dialogs, tables, and more.
- **next-themes**: Manages light and dark theme switching seamlessly.
- **Docker & Docker Compose**: Containerizes our local environment (PostgreSQL) for consistency across machines.

### 1.2 Scalability, Maintainability, and Performance
- **Server Components**: By default, pages and components in `/app` are server-rendered, reducing client bundle size and improving load times.
- **API Routes**: We organize backend logic (authentication, check-ins, webhooks) under `/app/api`, separating concerns and keeping UI code clean.
- **Modular Code Organization**: Directories (`/app`, `/components`, `/lib`, `/db`) group related code, making it easy to locate and update features.
- **Type Safety**: TypeScript and Drizzle ORM prevent mismatches between our code and database, cutting down on bugs.

## 2. Design Principles

### 2.1 Usability
- **Clear Layouts**: We use consistent header, sidebar, and content areas so users always know where they are.
- **Intuitive Controls**: Buttons, forms, and dialogs follow familiar patterns (e.g., primary/secondary buttons, clear labels).

### 2.2 Accessibility
- **Semantic HTML**: We use `<button>`, `<nav>`, `<main>`, and `<form>` tags correctly.
- **ARIA Attributes**: Provided by shadcn/ui components for screen-reader support.
- **Keyboard Navigation**: All interactive elements are reachable and operable by keyboard.

### 2.3 Responsiveness
- **Mobile-First**: Styles start with small screens in mind, then scale up for tablets and desktop via Tailwind’s responsive utilities.
- **Fluid Layouts**: Components use relative sizing (flex, grid) to adapt to different viewports.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Utility-First with Tailwind**: We build nearly all styles using Tailwind CSS classes to keep CSS minimal and predictable. There is no separate SASS or BEM—Tailwind handles it.
- **Global Styles**: Defined in `globals.css` for base typography and resets.

### 3.2 Theming
- **Dark/Light Mode**: Handled by `next-themes`. We wrap our app in a `<ThemeProvider>` in `layout.tsx` and toggle themes via a simple switch.

### 3.3 Visual Style
- **Overall Style**: Modern flat design with subtle glassmorphism touches (semi-transparent cards, soft shadows) for emphasis.
- **Color Palette**:
  • Primary Blue: #3B82F6  
  • Accent Green: #10B981  
  • Slate Gray: #6B7280  
  • Dark Gray: #1F2937  
  • Light Gray: #F9FAFB

- **Typography**: We use the **Inter** font (imported via Next.js’ built-in font optimization) for clean, legible text. Headings are bolded and use larger sizes; body text is medium weight.

## 4. Component Structure

### 4.1 Organization
- `/app`: Contains page layouts, server and client components, and API routes. Folders mirror routes (e.g., `/app/dashboard`, `/app/sign-in`).
- `/components/ui`: Houses shadcn/ui components and any custom UI building blocks.
- `/components`: Custom, reusable components like `AppSidebar`, `AuthButtons`, `ChartAreaInteractive`, `DataTable`, etc.
- `/lib`: Utility functions (`utils.ts`, authentication helpers) and service logic.
- `/db`: Drizzle ORM schemas and database client setup.

### 4.2 Reuse and Maintainability
- **Atomic Design**: We break UI into atoms (buttons, inputs), molecules (form groups), and organisms (modals, tables).
- **Props and Customization**: Components accept props for text, variants, and event handlers so they can be reused in multiple contexts.
- **Single Responsibility**: Each component does one thing—either layout, data visualization, or user interaction—making testing and updates safer.

## 5. State Management

- **Server vs. Client State**: Data fetching and mutations happen via Next.js Server Components and API Routes. UI state (modals open/close, form inputs) is handled in client components with React’s `useState`, `useEffect`.
- **Global State**: For simple global needs (theme, user session), we use React Context (via `next-themes` and authentication provider).
- **Data Fetching**: We rely on Next.js’s built-in data fetching in server components (`fetch`) and pass results down as props. For more complex caching or optimistic updates, you can introduce React Query or SWR.

## 6. Routing and Navigation

- **File-Based Routing**: Each folder under `/app` corresponds to a route (e.g., `/app/dashboard` → `/dashboard`).
- **Dynamic Routes**: Named with brackets (e.g., `/app/api/auth/[...all]/route.ts`).
- **Linking**: We use Next.js’s `<Link>` component for client-side transitions.
- **Layout**: A `layout.tsx` at the root defines common UI (header, sidebar, theme switcher) that wraps all pages.

## 7. Performance Optimization

- **Server Components**: Keep heavy logic on the server and send minimal HTML to the client.
- **Code Splitting**: Next.js automatically splits code by route. For large components (e.g., charts), we use `dynamic()` imports with suspense to lazy-load them.
- **Image Optimization**: Use `next/image` for responsive, optimized images.
- **CSS Purging**: Tailwind’s built-in purge removes unused CSS in production builds.
- **Caching & CDN**: Leverage Next.js’s caching headers and deploy to a CDN-backed platform for global performance.

## 8. Testing and Quality Assurance

- **Unit Tests**: Use **Jest** or **Vitest** for testing business logic (e.g., streak calculations).
- **Component Tests**: Use **React Testing Library** to verify component rendering, props, and user interactions.
- **End-to-End Tests**: Use **Playwright** or **Cypress** to simulate real user flows (sign-up, check-in, dashboard interactions).
- **Linting & Formatting**: Enforce consistent code style with **ESLint** (TypeScript rules) and **Prettier**.
- **Continuous Integration**: Set up GitHub Actions to run lint, tests, and build on each pull request.

## 9. Conclusion and Overall Summary

The StreakPair frontend combines Next.js’s modern App Router, TypeScript, Tailwind CSS, and shadcn/ui to deliver a scalable, maintainable, and high-performance application. By following these guidelines—modular architecture, clear design principles, utility-first styling, component reusability, and robust testing—you ensure that the app remains reliable and easy to extend. Unique aspects like server components for data loading and built-in dark mode support differentiate StreakPair, providing a polished user experience and a solid foundation for future growth.