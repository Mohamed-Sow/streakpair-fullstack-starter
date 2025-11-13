# StreakPair - Social Accountability App

StreakPair is a beautiful mobile app that helps you and a partner track daily habits together through photo/text check-ins. Stay motivated and accountable by maintaining streaks with your accountability partner.

## Features

- **User Authentication**: Secure sign-up and login with email/password
- **Create Streaks**: Set up daily habits you want to track
- **Partner Accountability**: Invite partners to join your streaks via unique invite codes
- **Daily Check-ins**: Submit daily proof with photos and notes
- **Streak Tracking**: Visual calendar showing your progress and current streak count
- **Real-time Updates**: See your partner's check-ins and progress
- **Beautiful UI**: Gradient cards, smooth animations, and intuitive design

## Tech Stack

### Frontend
- **Expo SDK 53** with React Native 0.79.2
- **React 19.0.0** with full concurrent features
- **React Navigation 7** for navigation (bottom tabs + native stack)
- **NativeWind** (TailwindCSS) for styling
- **Zustand** for state management
- **Better Auth** with Expo plugin for authentication
- **Lucide React Native** for icons
- **TypeScript 5.8.3** with strict mode

### Backend (Vibecode Cloud)
- **Bun** runtime
- **Hono** web framework
- **Prisma ORM** with SQLite database
- **Better Auth** for user management

## Project Structure

```
/home/user/workspace/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main streaks list with mini bar charts
│   │   ├── ProfileScreen.tsx       # User profile with stats & achievements
│   │   ├── AuthScreen.tsx          # Login/signup modal
│   │   ├── CreateStreakScreen.tsx  # Create new streak with competition options
│   │   ├── StreakDetailScreen.tsx  # View streak details with calendar & leaderboard
│   │   ├── CheckInScreen.tsx       # Daily check-in with photo upload
│   │   ├── PhotoGalleryScreen.tsx  # Grid view of all check-in photos
│   │   └── InsightsScreen.tsx      # Analytics dashboard with trends
│   ├── components/
│   │   ├── LoginWithEmailPassword.tsx  # Auth component
│   │   ├── LoginButton.tsx             # Auth button
│   │   ├── CelebrationModal.tsx        # Milestone celebration modal
│   │   ├── SkeletonLoader.tsx          # Animated loading placeholder
│   │   └── OnboardingScreen.tsx        # First-time user onboarding
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Root stack + bottom tabs
│   │   └── types.ts                # Navigation type definitions
│   ├── state/
│   │   └── streaksStore.ts         # Zustand store for streaks
│   └── lib/
│       ├── api.ts                  # API client for backend requests
│       ├── authClient.ts           # Better Auth client config
│       ├── queryClient.ts          # React Query configuration
│       └── useSession.ts           # Session hook
├── backend/
│   ├── src/
│   │   ├── index.ts                # Hono app entry point
│   │   ├── auth.ts                 # Better Auth configuration
│   │   ├── db.ts                   # Prisma client
│   │   └── routes/
│   │       ├── streaks.ts          # Streak API endpoints
│   │       └── upload.ts           # Image upload handler
│   └── prisma/
│       ├── schema.prisma           # Database schema
│       └── migrations/             # Database migrations
└── shared/
    └── contracts.ts                # Shared API types (Zod schemas)
```

## Database Schema

- **User**: Authentication and profile data
- **Streak**: Habit tracking entities with invite codes
- **StreakMember**: Join table for user-streak relationships
- **CheckIn**: Daily check-in records with photos and notes

## API Endpoints

- `GET /api/streaks` - Get all user's streaks
- `POST /api/streaks` - Create a new streak
- `POST /api/streaks/join` - Join a streak via invite code
- `GET /api/streaks/:id` - Get streak details
- `POST /api/streaks/:id/check-in` - Submit daily check-in

## Design System

**Design Philosophy (2025 Refinement):**
The app has evolved from colorful, gradient-heavy design to a more refined, scannable aesthetic inspired by top productivity apps:
- **Minimal Visual Noise**: Simplified cards with subtle borders instead of heavy gradients
- **Consistent Color Language**: Color-coded left borders indicate status (gold=competition, green=completed, orange=active)
- **Data-First**: Information hierarchy prioritizes key metrics (streak count, consistency %)
- **Delightful Moments**: Celebrate achievements without overwhelming daily use
- **Authentic Accountability**: No artificial streak protection - missed days matter

**Original Inspirations:**
- **Everyday App**: Colorful board view, visual discipline tracking
- **Opal**: Minimal design, data-driven aesthetic, Focus Score percentages
- **Duolingo**: Streak gamification and milestone celebrations
- **BeReal**: Daily photo authenticity
- **Structured**: Clean card layouts, swipeable interfaces
- **Habitica**: Gamification and achievement systems

**Colors:**
- Black `#000000` - Primary actions & text
- Success Green `#00D9A5` - Completed check-ins & high consistency (70%+)
- Warning Orange `#FFA500` - Medium consistency (40-69%)
- Alert Red `#EF4444` - Low consistency (<40%)
- Background `#FAFAFA` - Clean, minimal background
- Card White `#FFFFFF` - Main content cards

**Key UI Components:**
- **Simplified Streak Cards**: Clean white cards with colored left borders (4px), minimal emoji badges, compact competition info
- **Mini Bar Charts**: 7-day consistency visualization (40px height for active days, 8px for inactive)
- **Progress Indicators**: Color-coded consistency badges (green/orange/red)
- **Milestone Celebrations**: Full-screen confetti modals at achievement milestones
- **Skeleton Loaders**: Animated placeholders during loading states
- **Onboarding Slides**: 3-screen swipeable introduction for new users
- **Leaderboard**: Partner ranking by 30-day consistency percentage
- **Calendar Grid**: 7x7 week grid showing check-in history
- **Consistency Scores**: Large percentage displays (Opal-style)

**Inspiration:**
- **Everyday App**: Colorful board view, visual discipline tracking
- **Opal**: Minimal design, hourly bar charts, Focus Score percentages
- **Duolingo**: Streak gamification and fire icons
- **BeReal**: Daily photo authenticity

## Development Status

✅ Backend API with Prisma + Better Auth
✅ User authentication flow
✅ Home screen with mini bar charts & consistency visualization
✅ Create streak form with emoji picker
✅ Check-in with camera/photo upload
✅ Streak detail screen with calendar & leaderboard
✅ Profile with consistency metrics & achievements
✅ Navigation structure
✅ **NEW: Everyday/Opal-inspired redesign**
  - Mini 7-day bar charts on streak cards
  - Leaderboard with partner consistency percentages
  - Clean white card design with subtle shadows
  - 30-day consistency scoring
  - Visual progress bars with color coding
✅ **NEW: Competition Mode Features** (Fully Functional)
  - Toggle competition mode ON/OFF with vibrant orange switch
  - Competition types: 1v1 Duo, Team, Free-for-All
  - End date picker with comprehensive validation (format, future dates, max 1 year)
  - Consequence options: None, Monetary stakes, or Custom punishment
  - Monetary stakes: Enter prize per person, winner takes all pot
  - Custom punishment: Define creative consequences for losing
  - Backend fully integrated with all competition fields in database
  - Automatic reward pool calculation as members join
  - Golden trophy badge on competition cards in home screen
  - Prize pool and days remaining display on streak cards
  - Competition-aware UI throughout (check-ins, leaderboard)
✅ **FIXED: Improved API error handling**
  - Better detection of HTML vs JSON responses from server
  - More descriptive error messages for debugging
  - Graceful handling of server errors and network issues
  - User-friendly error UI with retry and login options
  - Session expiration detection with auto-redirect to login
  - Non-blocking error banners when data is already loaded
  - Fixed NSURLErrorDomain error -1013 on iOS (switched from expo/fetch to native global fetch)
  - Added detailed request/response logging for easier debugging
✅ **NEW: UI/UX Polish & Production Ready**
  - Pull-to-refresh on all screens (Home, Streak Detail, Profile)
  - Comprehensive date validation in Create Streak (format, future dates, max 1 year)
  - Haptic feedback on all key interactions (emoji selection, competition toggle, check-ins, success/error states)
  - Better error messages and user guidance
  - Improved loading states throughout the app
  - Fixed competition toggle layout (proper spacing, no cutoff)
  - Smooth animations and transitions for premium feel
  - ✅ **Redesigned Streak Cards** - Beautiful gradient accents, enhanced depth with shadows, gradient emoji badges, color-coded consistency badges, enhanced competition info cards, bigger and bolder typography
  - ✅ **Personalized Home Header** - Time-based greetings (Good morning/afternoon/evening + first name), context-aware subtitles showing progress, quick stats cards with Active Streaks and Today's Progress at a glance
  - ✅ **Beautiful Gradient Backgrounds** - Premium coral-to-purple gradient added to auth/login screen, welcome screen, and splash screen for stunning first impression

✅ **NEW: Refined Design System (2025 Update)**
  - ✅ **Simplified Streak Cards** - Cleaner card design with colored left border (gold/green/orange), removed heavy gradients for better scanability, compact competition info, improved visual hierarchy
  - ✅ **Celebration Animations** - Confetti celebrations for milestone achievements (7, 30, 100, 365-day streaks), milestone badges for check-in achievements (10, 50, 100 check-ins), animated modal with gradient backgrounds
  - ✅ **Skeleton Loaders** - Animated loading states for better perceived performance, skeleton cards matching actual UI design, smooth fade-in transitions
  - ✅ **Onboarding Flow** - Beautiful 3-screen onboarding introducing key features, swipeable slides with pagination dots, gradient icons matching app aesthetic, skip option and persistent completion state
  - ✅ **Enhanced Typography** - Improved font weights and letter spacing, better visual hierarchy throughout app, increased readability with optimized line heights
  - ✅ **Photo Gallery** - View all check-in photos in a beautiful grid layout, full-screen photo viewer with date and notes, filterable by user, accessible from streak detail screen
  - ✅ **Auto-Refresh** - Streak detail screen automatically refreshes when returning from check-in, ensuring data is always up-to-date
  - ✅ **Insights & Analytics** - Dedicated insights screen showing weekly/monthly trends with trend indicators (arrows showing improvement), key metrics dashboard (total check-ins, longest streak, active streaks, average per day), 7-day vs 14-day comparison, 30-day vs 60-day performance tracking, visual trend indicators with color coding

✅ **NEW: Production Configuration & Assets**
  - App.json configured with proper bundle IDs (com.witnessme.app)
  - iOS and Android permissions configured (Camera, Photos)
  - ✅ App icon created (beautiful flame gradient design)
  - ✅ Adaptive icon for Android
  - ✅ Splash screen with flame logo
  - ✅ Favicon for web version
  - ✅ **Legal Documents Complete** - Privacy Policy and Terms of Service ready for App Store submission
  - EAS build configuration ready
  - Deployment guide created (see DEPLOYMENT.md)

📋 **TODO: Final Launch Prep**
  - [ ] Capture 6-8 screenshots for App Store/Google Play
  - [ ] Final end-to-end testing on physical devices
  - [ ] Update legal document contact emails and company info
  - [ ] Host Privacy Policy and Terms of Service online (required URLs for app stores)
  - [ ] Submit to App Store and Google Play

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions, including:
- Asset requirements and design guidelines
- EAS build configuration
- App Store submission process
- Pre-launch checklist

---

Built with Vibecode - The AI-powered app builder

This repository includes a production-ready Expo + React Native template designed for AI agents and engineers to rapidly build high-quality mobile apps in the [Vibecode](https://vibecodeapp.com) mobile app and website. This guide explains how the template is set up, the technical decisions behind it, best practices, and the first steps you should take after the initial prompt.

If you are an AI engineer (human or agent), please read the whole file carefully before making changes.


## Stack and key decisions
- Expo SDK 53, React Native 0.79.2, React 19.0.0, TypeScript 5.8.3
- Navigation: React Navigation 7
  - `@react-navigation/native-stack` for native-feeling stacks and `@react-navigation/bottom-tabs` for tabs.
  - Example Router is implemented in `src/navigation/RootNavigator.tsx` with a root stack and a tab navigator as an example.
  - You must edit the navigator after the first prompt from the user. Remove all unused tabs from the navigator and their corresponding screen files in `src/screens/`
  — DO NOT leave empty or placeholder tabs/screens when you edit the navigator.
  - For Games and full screen app experiences, remove the tab navigator entirely. You may also want to remove the header and back button. You will be punished if the user sees any existing placeholder tab and page.
  - Please either create at least 2 fully functional tabs with real content, or remove the tab navigator. Never create apps with 1 tab or empty tabs. When removing tabs, also remove the unused screen files.
  - Don't customize insets in tabs and header. That means no SafeAreaView or useSafeAreaInsets in screens that are tabs or use default react navigation header.
- TypeScript with strict mode
  - Path alias `@/*` configured in `tsconfig.json` for clean imports.
  - Follow strict typing and avoid `any`. Use the TypeScript LSP and ESLint to help you write correct code with proper types.
- Styling: Nativewind (Tailwind) + Tailwind Merge
  - Global Tailwind is imported in `index.ts` via `global.css`.
  - Prefer `className` for `Text` and `View`; use `StyleSheet` for FlatList/Animated/complex components.
- Gestures & animations
  - `react-native-gesture-handler` and `react-native-reanimated@3` are preconfigured.
- Icons: Use `lucide-react-native` for all icons
- State management
  - Zustand + optional AsyncStorage persistence. Place stores in `src/state`. Persist minimally.

## Original File Tree of Template (does not track changes you make)
Current working directory (CWD): `home/user/workspace`
│
├── assets/
├── src/
│ ├── components/
│ ├── screens/
│ │ ├── HomeScreen.tsx # Example home tab screen, should be removed if no tabs are needed
│ │ ├── InsideScreen.tsx # Example stack screen, this is how most screens will be structured
│ │ └── SecondScreen.tsx # Example tab screen, should be removed if no tabs are needed
│ ├── navigation/
│ │ ├── RootNavigator.tsx # Root stack + tabs example, tabs stack should be removed if no tabs are needed, but stack is how most screens will be structured
│ │ └── types.ts # Strongly typed navigation params, to be used in every screen component in `src/screens`
│ ├── api/
│ │ ├── transcribe-audio.ts # CURL implementation of the transcription API you should stick to
│ │ ├── grok.ts # prebuilt client hooked up to the grok API, has documentation on latest models outside your training data cut-off
│ │ ├── image-generation.ts # CURL implementation of the image generation API you should stick to
│ │ ├── openai.ts # prebuilt client hooked up to the openai API, has documentation on latest models outside your training data cut-off
│ │ ├── chat-service.ts # prebuilt functions for getting a text response from LLMs.
│ ├── types/  
│ │ └── ai.ts # AI request/response types
│ ├── utils/  
│ │ └── cn.ts # includes helper function to merge classnames for tailwind styling
│ └── state/ # Example for using local storage memory
│   └── rootStore.example.ts # Example store using Zustand, should be removed if no state is needed
│
├── server/ # Bun + Hono + Prisma backend
│ ├── prisma/
│ │ └── schema.prisma # Prisma schema
│ │ └── dev.db # Prisma SQLite database used for development
│ │ └── migrations/ # Prisma migrations
│ ├── src/
│ │ ├── index.ts # Hono app: middleware, auth handler, routes, health check
│ │ ├── auth.ts # Better Auth config (expo plugin), Prisma adapter, email/password
│ │ ├── db.ts # Prisma client singleton with dev-time global caching
│ │ └── env.ts # Zod-validated environment variables and types
│ ├── generated/ # generated Prisma client 
│ ├── package.json
│ └── tsconfig.json
│
├── shared/ # Shared Zod contracts and types
│ └── contracts.ts # Very important to keep synced between server and frontend
│
├── patches/ # Forbidden
│ ├── expo-asset@11.1.5.patch # Forbidden
│ └── react-native@0.79.2.patch # Forbidden
├── App.tsx # Entrypoint, must be updated to reflect progress
├── index.ts # imports global.css -- tailwind is already hooked up
├── global.css # Don't change unless necessary, use tailwind
├── tailwind.config.js # Customize this if needed
├── tsconfig.json # Forbidden
├── babel.config.js # Forbidden
├── metro.config.js # Forbidden
├── app.json # Forbidden
├── package.json # Dependencies and scripts, view for pre-installed packages
├── bun.lock # Reminder, use bun
├── generate-asset-script.ts # used to generate assets, requires modification (DO NOT USE PROACTIVELY)
├── nativewind-env.d.ts # Forbidden
├── .gitignore # Forbidden
├── .prettierrc # Forbidden
└── .eslintrc.js # Forbidden


## Environment and constraints (Vibecode)
- Dev Expo server is managed automatically (port 8081). Do not check, change, or restart it; if preview issues occur, ask the user to click the refresh button or pull to refresh within the Vibecode app.
- Backend is running on port 3000 automatically. Do not check, change, or restart it. 
- Do not manage git. It is done automatically.
- You can view all logs by reading the `home/user/workspace/expo.log` file. The user can view the logs in the Vibecode app.
- Use `bun` (not npm/yarn). Scripts are in `template-app-53/package.json`.
- Environment variables are injected at runtime; access via `process.env.EXPO_PUBLIC_*` directly. Do NOT use `@env` or `expo-constants` for secrets.
- The user can add new enviroment variables using the ENV tab on the Vibecode app.

## Dependency policy: why versions are fixed
- Stability first: The template pins React Native and Expo to known-good versions that work with the included patches in `patches/` and `patchedDependencies` in `package.json`.
- Predictability for agents: Avoids unexpected native changes or autolinking inconsistencies that break the build.
- Security and review: Minimizes drift so changes are deliberate and reviewable.

### What you can install
- Allowed: JavaScript-only libraries (e.g., utilities like `lodash`, validation like `zod`, UI helpers without native modules, icon fonts, or Google font packages like `@expo/google-fonts` packages like `@expo/google-fonts/Roboto` or `@expo/google-fonts/Inter` for fonts.).
- Allowed: ANY packages in the `backend` directory.
- Avoid: New native modules or libraries that require custom native configuration. Many common native modules are already included; prefer using what is preinstalled.
- If in doubt, prefer using or extending the included modules. Do not add packages that require custom config plugins or manual native steps.

## First steps after the first prompt
1. Update navigation
   - Edit `src/navigation/RootNavigator.tsx` to define the routes you need. Add or rename tabs and stack screens. Use `headerShown`/`headerTransparent`/`presentation` as appropriate.
2. Create screens
   - Add files in `src/screens/` using the strongly-typed helpers from `src/navigation/types.ts`. Use `Pressable` (not `TouchableOpacity`).
   - For scrollable screens with headers, use `useHeaderHeight()` and set `contentInsetAdjustmentBehavior="automatic"` where needed.
3. Set up state
   - Create minimal Zustand stores in `src/state`. Use individual selectors to avoid infinite loops. Persist only the necessary slices with AsyncStorage if needed.
4. Styling and theming
   - Use Tailwind classes via `className` on `Text`/`View`. Use `StyleSheet` for complex or animated components.
   - Use `lucide-react-native` for iconography.
5. Safe areas & headers
   - `App.tsx` already includes `SafeAreaProvider`. Inside screens use `View`, not `SafeAreaView`, unless you use a custom header component. Most cases you can configure headers via navigator options.
6. Keyboard safety
   - Ensure inputs are not obscured by the keyboard. Use appropriate padding/scrolling and dismiss keyboards when tapping outside.
   - Use the `KeyboardAvoidingView` or `KeyboardAvoidingScrollView` or `react-native-keyboard-controller` library to manage the keyboard.

## Commands
There are only a few scripts you will need, as the Vibecode dev Expo server is managed automatically, and the app can be previwed using the Vibecode app.
```bash
bun run typecheck    # typecheck with TypeScript
bun run lint         # lint with Expo config
bun run format       # Prettier format
```