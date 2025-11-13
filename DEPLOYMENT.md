# WitnessMe - Deployment Guide

## 📱 App Store Preparation Checklist

### 1. Assets (✅ Complete!)
- [x] App Icon (1024x1024px) - `assets/icon.png` ✅
- [x] Adaptive Icon (1024x1024px) - `assets/adaptive-icon.png` ✅
- [x] Splash Screen (2048x2048px) - `assets/splash.png` ✅
- [x] Favicon (48x48px) - `assets/favicon.png` ✅

**Design:**
- Beautiful flame gradient (orange to purple)
- Represents "streak" and "fire" concept perfectly
- Clean, modern, recognizable at all sizes
- Works great on light and dark backgrounds

### 2. App Configuration (✅ Complete)
- [x] Bundle IDs configured (com.witnessme.app)
- [x] Version numbers set (1.0.0)
- [x] Permissions configured (Camera, Photos)
- [x] Splash screen background color set

### 3. Legal Documents (✅ Complete!)
- [x] Privacy Policy - `PRIVACY_POLICY.md` ✅
- [x] Terms of Service - `TERMS_OF_SERVICE.md` ✅

**Next Steps:**
1. Update contact emails in both documents (replace `privacy@witnessme.app` and `support@witnessme.app` with your actual emails)
2. Add your company name and jurisdiction information
3. Host these documents online and get public URLs
4. Add the URLs to your app store listings

**Note**: App Store and Google Play require publicly accessible URLs for Privacy Policy and Terms of Service. You can host them on:
- Your own website
- GitHub Pages
- A simple static site hosting service

### 4. App Store Metadata

#### App Name
**WitnessMe** - Stay Accountable Together

#### Description (Short)
Build lasting habits with photo check-ins and partner accountability. Track streaks, compete with friends, and stay motivated together.

#### Keywords
habit tracker, accountability, streaks, consistency, partner, check-in, goals, motivation, competition

#### Category
- Primary: Productivity
- Secondary: Health & Fitness

#### Screenshots Needed
- 6.7" iPhone (1290 x 2796px) - 3-8 screenshots
- 12.9" iPad (2048 x 2732px) - 3-8 screenshots
- Android (1080 x 1920px) - 2-8 screenshots

**Recommended Screenshots:**
1. Home screen with streak cards
2. Streak detail with calendar and leaderboard
3. Check-in screen with photo
4. Profile with stats and achievements
5. Create streak screen with competition mode

### 5. Build Process

#### Install EAS CLI
```bash
npm install -g eas-cli
```

#### Login to Expo
```bash
eas login
```

#### Configure Project
```bash
eas build:configure
```

#### Build for iOS
```bash
# Development build (for testing)
eas build --platform ios --profile development

# Production build (for App Store)
eas build --platform ios --profile production
```

#### Build for Android
```bash
# Development build (for testing)
eas build --platform android --profile development

# Production build (for Play Store)
eas build --platform android --profile production
```

### 6. Submission

#### iOS App Store
1. Create app in App Store Connect
2. Fill in metadata (name, description, keywords)
3. Upload screenshots
4. Add privacy policy and terms URLs
5. Submit for review

```bash
eas submit --platform ios
```

#### Google Play Store
1. Create app in Google Play Console
2. Fill in store listing
3. Upload screenshots
4. Add privacy policy and terms URLs
5. Submit for review

```bash
eas submit --platform android
```

## 🔐 Environment Variables for Production

Make sure to set these in EAS:

```bash
eas secret:create --name EXPO_PUBLIC_VIBECODE_BACKEND_URL --value <your-production-backend-url>
```

## 📋 Pre-Launch Checklist

- [ ] All assets uploaded
- [ ] Privacy policy & terms created
- [ ] App tested on real devices (iOS & Android)
- [ ] All features working correctly
- [ ] Backend deployed to production
- [ ] Database migrations applied
- [ ] Error tracking configured (optional: Sentry)
- [ ] Analytics configured (optional: Amplitude, Mixpanel)
- [ ] App Store metadata prepared
- [ ] Screenshots captured
- [ ] Test builds distributed to beta testers

## 🚀 Launch Day

1. Submit iOS build to App Store Connect
2. Submit Android build to Google Play Console
3. Wait for review (1-3 days for iOS, 1-7 days for Android)
4. Monitor for crashes or issues
5. Respond to user reviews

## 📊 Post-Launch

- Monitor app analytics
- Track user feedback
- Plan feature updates
- Fix bugs quickly
- Update regularly

---

**Current Status:** ✅ App ready for asset creation and legal documents
