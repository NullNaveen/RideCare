/**
 * DEPLOYMENT_CHECKLIST.md
 * 
 * Complete checklist for deploying RideCare to production
 */

# RideCare Deployment Checklist

## Pre-Deployment (Development Phase)

### 1. Code Quality
- [ ] All TypeScript strict mode enabled
- [ ] ESLint rules passing (no warnings)
- [ ] Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] Remove commented-out code
- [ ] Code review completed

### 2. Testing
- [ ] Unit tests passing (Jest) — Target: >80% coverage
  - [ ] MaintenanceEngine.test.ts
  - [ ] LocationService.test.ts
  - [ ] BLEService.test.ts
  - [ ] SyncService.test.ts
- [ ] Integration tests passing (Detox)
  - [ ] Onboarding flow
  - [ ] Trip recording end-to-end
  - [ ] Maintenance logging
- [ ] Manual testing on physical devices
  - [ ] iOS: iPhone 13+ (iOS 15+)
  - [ ] Android: Pixel 6+ (Android 11+)
- [ ] BLE testing with real bikes (TVS, Royal Enfield)
- [ ] Background location testing (8+ hour trips)
- [ ] Offline mode testing (airplane mode)

### 3. Performance
- [ ] App size < 50 MB (optimized assets)
- [ ] Cold start time < 3 seconds
- [ ] Trip recording battery drain < 10% per 8 hours
- [ ] GPS accuracy ±5% over 100 km
- [ ] Memory leaks tested (Xcode Instruments, Android Profiler)
- [ ] Network calls optimized (batch sync)

### 4. Security
- [ ] Firebase Security Rules audited
- [ ] API keys in environment variables (not hardcoded)
- [ ] SSL pinning implemented (if custom API)
- [ ] Encryption for local receipts (AES-256)
- [ ] ProGuard/R8 obfuscation enabled (Android)
- [ ] Jailbreak/root detection (optional)

---

## iOS Deployment

### 5. Xcode Configuration
- [ ] Bundle ID: `com.ridecare.app`
- [ ] Version: `1.0.0` (CFBundleShortVersionString)
- [ ] Build number: `1` (CFBundleVersion)
- [ ] Deployment target: iOS 13.0
- [ ] Signing: Distribution certificate + provisioning profile
- [ ] Capabilities enabled:
  - [ ] Background Modes → Location updates
  - [ ] Push Notifications
  - [ ] Bluetooth LE
- [ ] Info.plist keys:
  - [ ] `NSLocationAlwaysUsageDescription`
  - [ ] `NSLocationWhenInUseUsageDescription`
  - [ ] `NSBluetoothAlwaysUsageDescription`
  - [ ] `NSPhotoLibraryUsageDescription` (receipts)
- [ ] App Icon: 1024x1024 (App Store), all sizes generated

### 6. App Store Connect
- [ ] App created in App Store Connect
- [ ] Screenshots uploaded (6.5", 5.5", 12.9" iPad)
- [ ] App description, keywords, subtitle finalized
- [ ] Privacy Policy URL: `https://ridecare.app/privacy`
- [ ] Support URL: `https://ridecare.app/support`
- [ ] Age rating: 4+
- [ ] Pricing: Free (with IAP)
- [ ] In-App Purchase created: RideCare Pro ($2.99/month)
- [ ] TestFlight beta testing completed (20+ testers, 2 weeks)
- [ ] App Review Information:
  - [ ] Demo account credentials
  - [ ] Review notes (BLE pairing instructions)
- [ ] Export compliance: No encryption (or declare Firebase)

### 7. Build & Upload
```bash
cd mobile/ios
pod install
cd ..

# Archive build
xcodebuild -workspace ios/RideCare.xcworkspace \
  -scheme RideCare \
  -configuration Release \
  -archivePath build/RideCare.xcarchive \
  archive

# Upload to App Store Connect
xcodebuild -exportArchive \
  -archivePath build/RideCare.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

# OR use Fastlane
fastlane ios release
```

### 8. App Store Submission
- [ ] Submit for review
- [ ] Wait 24-48 hours for review
- [ ] Monitor App Store Connect for status
- [ ] Respond to App Review team if needed

---

## Android Deployment

### 9. Android Configuration
- [ ] Application ID: `com.ridecare.app`
- [ ] Version name: `1.0.0`
- [ ] Version code: `1`
- [ ] Min SDK: 29 (Android 10)
- [ ] Target SDK: 34 (Android 14)
- [ ] Signing: Release keystore generated
  ```bash
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore ridecare-release.keystore \
    -alias ridecare -keyalg RSA \
    -keysize 2048 -validity 10000
  ```
- [ ] `build.gradle` (app):
  - [ ] `minifyEnabled true` (ProGuard)
  - [ ] `shrinkResources true`
  - [ ] Signing config added
- [ ] Permissions in `AndroidManifest.xml`:
  - [ ] `ACCESS_FINE_LOCATION`
  - [ ] `ACCESS_BACKGROUND_LOCATION` (Android 10+)
  - [ ] `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT` (Android 12+)
  - [ ] `FOREGROUND_SERVICE`
  - [ ] `POST_NOTIFICATIONS` (Android 13+)
- [ ] `google-services.json` added (Firebase)

### 10. Play Console Setup
- [ ] App created in Google Play Console
- [ ] Store listing:
  - [ ] App name: RideCare - Bike Maintenance Tracker
  - [ ] Short description (80 chars)
  - [ ] Full description (4000 chars)
  - [ ] Screenshots: Phone (4), 7" Tablet (4), 10" Tablet (4)
  - [ ] Feature graphic: 1024x500
  - [ ] App icon: 512x512
- [ ] Content rating questionnaire completed
- [ ] Pricing: Free (with IAP)
- [ ] In-app products: RideCare Pro (₹249/month)
- [ ] Privacy Policy URL: `https://ridecare.app/privacy`
- [ ] Data safety section filled
  - [ ] Location data: Collected, not shared
  - [ ] Personal info: Email (account creation)

### 11. Build & Upload
```bash
cd mobile/android

# Generate release AAB
./gradlew bundleRelease

# Sign AAB (if not auto-signed)
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore ridecare-release.keystore \
  app/build/outputs/bundle/release/app-release.aab \
  ridecare

# OR use Fastlane
fastlane android release
```

### 12. Play Store Submission
- [ ] Upload AAB to internal testing track
- [ ] Test with internal testers (5+ users, 1 week)
- [ ] Promote to closed testing (alpha/beta) — 50+ users, 2 weeks
- [ ] Submit for production review
- [ ] Staged rollout: 10% → 25% → 50% → 100% over 7 days
- [ ] Monitor crash reports (Firebase Crashlytics)

---

## Post-Deployment

### 13. Monitoring & Analytics
- [ ] Firebase Analytics configured
- [ ] Key events tracked:
  - [ ] `app_open`
  - [ ] `trip_start`, `trip_complete`
  - [ ] `maintenance_logged`
  - [ ] `ble_pairing_success`
  - [ ] `subscription_purchased`
- [ ] Firebase Crashlytics enabled
- [ ] Set up alerts for crash rate > 1%
- [ ] App Store / Play Console reviews monitored

### 14. Marketing Launch
- [ ] Landing page live: `https://ridecare.app`
- [ ] Blog post announcing launch
- [ ] Social media posts (Twitter, Instagram, LinkedIn)
- [ ] Product Hunt submission (if applicable)
- [ ] Reddit posts in r/motorcycles, r/IndianBikes
- [ ] Outreach to YouTube reviewers (Powerdrift, BikeWale)
- [ ] Press release (if budget allows)

### 15. Support Setup
- [ ] Support email: `support@ridecare.app` monitored
- [ ] Help center / FAQ page created
- [ ] In-app chat support (optional: Intercom, Zendesk)
- [ ] Community Discord/Telegram (optional)

### 16. Legal & Compliance
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] GDPR compliance verified (EU users)
- [ ] CCPA compliance verified (California users)
- [ ] Cookie consent banner (if web app)
- [ ] Data processing agreement with Firebase/Google

### 17. Backups & Disaster Recovery
- [ ] Firebase project backed up (Firestore export)
- [ ] Code repository backed up (GitHub)
- [ ] Keystore backed up securely (encrypted, offline)
- [ ] Rollback plan documented (revert to v0.9.x)

---

## Week 1 Post-Launch Checklist

### Days 1-3
- [ ] Monitor crash-free rate (target: >99%)
- [ ] Check average session duration (target: >5 min)
- [ ] Verify GPS accuracy reports from users
- [ ] Respond to App Store/Play Store reviews
- [ ] Fix critical bugs (P0/P1) within 24 hours

### Days 4-7
- [ ] Analyze onboarding completion rate (target: >60%)
- [ ] Analyze subscription conversion rate (target: >2%)
- [ ] Gather user feedback via in-app survey
- [ ] Plan v1.1 features based on feedback
- [ ] Publish blog post: "What We Learned in Week 1"

---

## Success Metrics (90 Days)

- **Downloads:** 5,000+ (iOS + Android combined)
- **Active Users (DAU):** 1,000+
- **Paid Subscribers:** 100+ (2% conversion)
- **Crash-Free Rate:** >99.5%
- **App Store Rating:** >4.5 stars
- **Play Store Rating:** >4.5 stars
- **Retention (Day 7):** >40%
- **Trip Accuracy:** ±5% over 100 km (GPS)
- **Battery Drain:** <10% per 8 hours

---

## Version 1.1 Planning

- [ ] Feature: Multi-bike support
- [ ] Feature: Predictive maintenance (AI/ML)
- [ ] Feature: Car support (OBD-II)
- [ ] Localization: Hindi, Marathi, Tamil
- [ ] Integration: Popular service centers (Urbanclap, etc.)
- [ ] Widget: iOS home screen widget (odometer)

---

**Deployment Lead:** [Your Name]  
**Last Updated:** January 2026  
**Status:** 🟢 Ready for Production
