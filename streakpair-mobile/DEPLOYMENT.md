# StreakPair Mobile - Deployment Guide

This guide covers the deployment process for the StreakPair React Native mobile application to both Apple App Store and Google Play Store.

## Prerequisites

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
2. **Apple Developer Account** ($99/year): [developer.apple.com](https://developer.apple.com)
3. **Google Play Console Account** ($25 one-time): [play.google.com/console](https://play.google.com/console)
4. **EAS CLI**: `npm install -g eas-cli`

## Setup

### 1. Initialize EAS Project

```bash
# Login to your Expo account
npx eas login

# Link your project to EAS
npx eas project:info

# Configure build profiles
npx eas build:configure
```

### 2. Environment Configuration

Update your `app.json` with proper identifiers:

```json
{
  "expo": {
    "name": "StreakPair",
    "slug": "streakpair",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.streakpair",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.yourcompany.streakpair",
      "versionCode": 1
    }
  }
}
```

### 3. Environment Variables

Create environment-specific files:

- `.env.development` - Development API endpoints
- `.env.production` - Production API endpoints

## Building for Development

### Preview Build (Internal Distribution)

```bash
# Android APK for testing
npx eas build --platform android --profile preview

# iOS for testing (requires Apple Developer account)
npx eas build --platform ios --profile preview
```

### Development Build

```bash
# Create development build with Expo Go
npx eas build --profile development
```

## Production Deployment

### Android (Google Play Store)

1. **Setup Google Play Console**:
   - Create new app
   - Fill out store listing
   - Set up content rating
   - Configure pricing and distribution

2. **Build Production APK**:
   ```bash
   npx eas build --platform android --profile production
   ```

3. **Upload to Play Store**:
   ```bash
   npx eas submit --platform android --profile production
   ```

### iOS (Apple App Store)

1. **Setup App Store Connect**:
   - Create new app in App Store Connect
   - Fill out app information
   - Set up pricing and availability
   - Configure App Store Review information

2. **Build Production IPA**:
   ```bash
   npx eas build --platform ios --profile production
   ```

3. **Upload to App Store**:
   ```bash
   npx eas submit --platform ios --profile production
   ```

## Build Profiles

The project includes pre-configured build profiles in `eas.json`:

- **development**: Development builds with fast refresh
- **preview**: Internal testing builds (APK for Android, development profile for iOS)
- **production**: App Store and Play Store ready builds

## Store Assets

### Required Assets

1. **App Icons**:
   - iOS: Multiple sizes (1024x1024, 180x180, 120x120, etc.)
   - Android: Adaptive icon (512x512 foreground, background)

2. **Screenshots**:
   - Phone: 6.7" display (1290x2796)
   - Tablet: 12.9" display (2048x2732)
   - Required: At least 3 screenshots per device type

3. **App Store Listing**:
   - App name and subtitle
   - Description (up to 4000 characters)
   - Keywords (up to 100 characters)
   - Support URL and privacy policy URL

### Generating Screenshots

Use Expo Screenshots to automate screenshot generation:

```bash
npx expo install expo-screenshots
npx screenshots
```

## Testing Before Release

### Internal Testing

1. **Android**: Use Play Console Internal Testing
2. **iOS**: Use TestFlight

```bash
# Build for internal testing
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
```

### External Testing (Beta)

1. **Android**: Closed testing in Play Console
2. **iOS**: TestFlight external testing

## Release Process

### Version Management

Update version numbers in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "1.0.1"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

### Release Checklist

- [ ] All features tested on both platforms
- [ ] App Store screenshots ready
- [ ] Store listing complete
- [ ] Privacy policy published
- [ ] App icon and splash screen optimized
- [ ] TestFlight/internal testing complete
- [ ] Production build successful
- [ ] Store submission approved

## Automated Workflows

### GitHub Actions

Create `.github/workflows/build.yml` for automated builds:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx eas build --platform android --profile preview
      - run: npx eas submit --platform android --profile preview
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check EAS build logs for specific errors
   - Verify bundle identifiers are unique
   - Ensure all required permissions are configured

2. **iOS Code Signing**:
   - Verify Apple Developer certificate is valid
   - Check provisioning profiles
   - Ensure bundle identifier matches Xcode configuration

3. **Android Bundle ID Conflicts**:
   - Use unique package name
   - Check if package exists in Play Store
   - Update version code for each release

### Useful Commands

```bash
# Check build status
npx eas build:list

# View build details
npx eas build:build-id <BUILD_ID>

# Cancel build
npx eas build:cancel <BUILD_ID>

# View submissions
npx eas submit:list

# Check project configuration
npx eas project:info
```

## Support Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction)
- [React Native Documentation](https://reactnative.dev)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)