# StreakPair Mobile App

A React Native mobile application for social accountability and streak management, built with Expo and TypeScript.

## Overview

StreakPair is a social accountability app that helps users maintain habits through shared commitment and collective consequences. The mobile app allows users to:

- Create and join streaks with partners
- Track daily check-ins with photo/text proof
- Monitor progress and analytics
- Manage invitations and team participation
- Stay motivated through social accountability

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand with persistence
- **API Communication**: Axios with interceptors
- **Storage**: Expo SecureStore for sensitive data
- **Authentication**: Better Auth integration
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom component library with Expo Linear Gradients

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card)
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── AppTabs.tsx
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   └── app/           # Main app screens
├── services/          # API and external services
│   └── api/           # API client and endpoints
├── store/             # Global state management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── hooks/             # Custom React hooks
```

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Physical iOS/Android device or emulator

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd streakpair-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your API base URL
   ```

### Running the App

1. Start the development server:
   ```bash
   npm start
   ```

2. Run on your device:
   ```bash
   # For Android
   npm run android

   # For iOS (macOS only)
   npm run ios

   # For web
   npm run web
   ```

## Environment Configuration

The app uses environment-specific configuration files:

- `.env.development` - Development environment
- `.env.production` - Production environment

Required environment variables:
- `EXPO_PUBLIC_API_BASE_URL` - Your backend API URL
- `EXPO_PUBLIC_ENVIRONMENT` - Environment identifier

## Key Features Implemented

### Authentication System
- User registration and login
- Password reset flow
- Email verification
- Biometric authentication support (Face ID/Touch ID)
- Secure token storage with Expo SecureStore

### API Layer
- Axios client with request/response interceptors
- Automatic token refresh
- Error handling with custom error classes
- File upload support for check-in images

### State Management
- Zustand for global state
- Secure persistence for authentication data
- Type-safe state updates

### UI Components
- Reusable Button, Input, and Card components
- Consistent styling with gradients
- Form validation and error handling
- Loading states and user feedback

### Navigation
- Stack navigator for authentication flow
- Bottom tab navigator for main app
- Protected routes based on authentication status

## Development Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Run TypeScript type checking

## API Integration

The mobile app is designed to work with the existing Next.js backend. The API client handles:

- Authentication endpoints
- Streak management
- Check-in creation and retrieval
- Invitation handling
- Analytics and data export

## Security Features

- Secure token storage using platform-specific Keychain/Keystore
- Automatic token refresh
- Request/response interceptors for security headers
- Input validation and sanitization
- Biometric authentication options

## Deployment

The app is configured for deployment to both Apple App Store and Google Play Store using EAS Build:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Configure your project:
   ```bash
   eas build:configure
   ```

3. Build for production:
   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android
   ```

## Contributing

1. Follow the existing code style and TypeScript conventions
2. Use the provided UI components for consistency
3. Add proper error handling and loading states
4. Update types when adding new API endpoints
5. Test on both iOS and Android platforms

## License

This project is part of the StreakPair social accountability platform.