# Product Specification: RideCare
**Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Product Owner:** Full-Stack Team  
**Target Platforms:** iOS 13+, Android 10+

---

## 1. Product Vision

**Mission Statement:**  
RideCare is the **dead-simple, privacy-first** bike maintenance tracker that **automatically reminds riders** when service, oil, chain, or tyre maintenance is due—preventing costly breakdowns and extending bike lifespan.

**Problem We Solve:**  
- Riders forget service due dates → engine damage (₹15,000+ repair costs).
- Manual logging apps have 70% abandonment rate (too tedious).
- Existing apps are car-focused; bikes need chain/tyre-specific reminders.
- No offline mode for touring riders.

**Why Now:**  
- BS6 bikes (2020+) have Bluetooth—opportunity for telemetry integration.
- 50M+ bikes sold in India (2023-2025); 80% lack digital service tracking.
- Privacy regulations (GDPR, CCPA) favor local-first apps.

---

## 2. Target Audience

### Primary Users
1. **Commuter Riders (60% of users)**  
   - Age: 22-35, daily riders (10-30 km/day).
   - Needs: Automatic reminders, minimal friction, dark mode.
   - Tech: Android (budget to mid-range), iOS (premium segment).

2. **Touring Enthusiasts (25%)**  
   - Age: 28-45, weekend long-distance riders (500+ km/trip).
   - Needs: Offline mode, trip history, fuel economy, detailed analytics.
   - Tech: iOS (higher disposable income), Android flagship.

3. **Casual Riders (15%)**  
   - Age: 18-25, scooter riders, low maintenance awareness.
   - Needs: Gentle nudges, simple UI, educational content.
   - Tech: Android (entry-level), limited storage.

### Secondary Users (Future)
- **Fleet Managers:** Small businesses (food delivery, logistics) managing 10-50 bikes.
- **Mechanics:** View customer bike history, schedule appointments.

---

## 3. Core User Flows

### 3.1 Onboarding Flow (First Launch)
1. **Welcome Screen**  
   - Hero image: Rider on bike with phone on mount.
   - Text: "Never miss maintenance again. Track your bike effortlessly."
   - CTA: "Get Started" (primary button).

2. **Permissions Request**  
   - **Location:** "RideCare needs location to track your rides automatically. We don't share your location with anyone." (required)
   - **Notifications:** "Get reminders when maintenance is due." (required)
   - **Bluetooth:** "Pair with your bike to read odometer." (optional, skippable in MVP).

3. **Account Creation**  
   - Options: Email, Google, Apple Sign-In.
   - Skip option: "Use without account" (data stored locally; can sync later).

4. **Bike Onboarding Wizard (13 steps)**  
   - Step 1: "Do you own a bike or are you testing?" (Owner/Tester).
   - Step 2: Bike nickname (e.g., "My Splendor").
   - Step 3: Make (dropdown: Hero, Bajaj, TVS, Honda, RE, Yamaha, Suzuki, KTM, Other).
   - Step 4: Model (auto-populated based on make; or free text).
   - Step 5: Year (dropdown: 2015-2025).
   - Step 6: Vehicle type (Motorcycle, Scooter, Moped).
   - Step 7: Engine details (BS6 Fuel Injection / BS4 Carb / Electric).
   - Step 8: Odometer reading now (numeric input, km).
   - Step 9: "Pair via Bluetooth?" (optional; grayed out in MVP → "Coming Soon").
   - Step 10: Maintenance thresholds (pre-filled; user can edit):
     - Service: 6,000 km or 6 months.
     - Oil change: 3,000 km or 3 months.
     - Chain lube: 500 km or 15 days.
     - Brake check: 12,000 km or 12 months.
     - Tyre inspection: 18,000 km or 18 months.
     - Battery: 24 months.
   - Step 11: Notification preferences (Push / Email / Calendar).
   - Step 12: "Share anonymized telemetry?" (toggle, default OFF).
   - Step 13: Service center location (optional; uses current location or manual entry).

5. **Quick Tutorial (3 screens)**  
   - Screen 1: "Your trips are tracked automatically when you ride."
   - Screen 2: "Get notified 200 km before maintenance is due."
   - Screen 3: "View trip history and analytics anytime."
   - CTA: "Start Riding" → Dashboard.

**Acceptance:** 90% completion rate; <90 seconds to complete.

---

### 3.2 Dashboard (Home Screen)
**Layout:**  
- **Top Bar:** App logo, hamburger menu (left), profile icon (right).
- **Hero Card:** Current bike nickname + make/model + odometer (e.g., "12,450 km").
- **Quick Stats (3 cards in horizontal scroll):**
  1. **Today:** 45 km (progress ring, animated).
  2. **This Week:** 203 km (vs. last week: +12%).
  3. **Next Service:** In 450 km (progress bar, orange if <200 km).
- **Maintenance Alerts (expandable list):**
  - ⚠️ Oil change due in 100 km (tap to view details).
  - ✅ Chain lubed 2 days ago (completed).
- **Trip History (scrollable list):**
  - Today: 2 trips (Morning: 18 km, Evening: 27 km).
  - Yesterday: 1 trip (38 km).
  - Tap any trip → Trip Detail screen.
- **FAB (Floating Action Button):** "Start Trip" (manual override; hidden if auto-tracking enabled).

**Interactions:**
- Pull-to-refresh: Syncs data from cloud.
- Swipe left on maintenance alert: "Mark Complete" or "Snooze".
- Tap bike card: Opens bike details (edit odometer, view maintenance schedule).

---

### 3.3 Trip Tracking (Automatic)
**Trigger:** User's speed >10 km/h for 30 seconds.

**Flow:**
1. **Auto-start:** Background location service starts. Persistent notification (Android): "RideCare is tracking your ride."
2. **Live tracking:** Dashboard updates in real-time (if app open): km driven, avg speed, duration.
3. **Auto-stop:** User stationary (<5 km/h) for 10 minutes → notification: "Trip ended. 15.3 km in 42 min. Save?"
4. **Save:** User taps "Save" → trip saved to local DB. User can add notes or rename trip.
5. **Discard:** User taps "Discard" → trip deleted; km not added to odometer.

**Battery Optimization:**
- GPS sampling: 1 second while moving (speed >20 km/h), 5 seconds while slow (<20 km/h), 30 seconds while stationary.
- Geofencing: If user at home/work (learned location), pause tracking after 5 min stationary.

---

### 3.4 Maintenance Notification Flow
**Trigger:** Rider's odometer reaches threshold (e.g., oil change due at 18,000 km; rider now at 17,800 km).

**Flow:**
1. **Notification 1 (200 km before):** "⚠️ Oil change due in 200 km. Tap to schedule."
2. **Notification 2 (100 km before):** "⚠️ Oil change due in 100 km. Don't delay!"
3. **Notification 3 (0 km / overdue):** "🔴 Oil change OVERDUE. Immediate action required."

**Actions:**
- **Tap notification:** Opens maintenance detail screen.
- **Mark Complete:** User enters date completed, cost, notes, receipt (optional) → notification cleared.
- **Snooze:** User taps "Remind me in 50 km" → notification re-appears.
- **Ignore:** Notification remains in app (badge count increases).

**Frequency Cap:** Max 1 notification per maintenance type per day (avoid spam).

---

### 3.5 Maintenance History Screen
**Layout:**
- **Tabs:** "Upcoming" (due soon/overdue), "Completed" (past), "All".
- **List view (card-based):**
  - Each card: Icon (service/oil/chain/brake/tyre/battery), type, due date, km due at, status (due in X km / overdue / completed).
  - Tap card: Expands to show notes, cost, receipts.
- **Filter/Sort:** By type, by date, by cost.
- **FAB:** "Add Maintenance" (manual entry for pre-app services).

**Add Maintenance Flow:**
1. User taps FAB → modal appears.
2. Fields: Type (dropdown), Date completed, Odometer at completion, Cost, Notes, Receipts.
3. Tap "Save" → maintenance added; notification (if recurring) resets.

---

### 3.6 Trip Detail Screen
**Layout:**
- **Header:** Date, start time, end time, duration.
- **Map:** Full-screen map with polyline (route). Zoom/pan enabled.
- **Stats (4 cards):**
  1. Distance: 15.3 km.
  2. Avg Speed: 32 km/h.
  3. Max Speed: 58 km/h.
  4. Fuel Est.: 0.36 L (based on bike's avg fuel economy).
- **Actions:** Edit (rename trip, add notes), Delete, Share (export as image or link).

---

### 3.7 Settings Screen
**Sections:**
1. **Account:** Profile picture, name, email, "Sign Out", "Delete Account".
2. **My Bikes:** List of bikes (support multi-vehicle in Phase 3). Tap to edit or delete.
3. **Notifications:** Toggle for push, email, calendar. Quiet hours (Do Not Disturb).
4. **Appearance:** Theme (Light / Dark / System), Compact mode (for scooters).
5. **Privacy:** Telemetry (toggle), Data Export (JSON), Location History (view/delete trips), Privacy Policy.
6. **Tracking:** Auto-start sensitivity (Low / Medium / High), GPS accuracy (High / Balanced / Low Power).
7. **About:** Version, Terms of Service, Open Source Licenses, Contact Support.

---

## 4. Feature Specifications

### 4.1 Maintenance Rules Engine
**Purpose:** Automate reminders based on km and/or time.

**Rule Types:**
1. **KM-based:** "Service every 6,000 km" (recurring).
2. **Time-based:** "Battery check every 24 months" (recurring).
3. **Combined:** "Chain lube every 500 km OR 15 days, whichever first" (logical OR).
4. **One-time:** "First service at 1,000 km" (non-recurring).

**Logic:**
- **Trigger evaluation:** On every trip end, engine recalculates due dates.
- **Notification thresholds:** 200 km before, 100 km before, 0 km (overdue).
- **Recurring reset:** When user marks maintenance complete, next due = current odometer + interval.

**Example:**
- Bike odometer: 12,000 km.
- Rule: Oil change every 3,000 km (last done at 9,000 km).
- Next due: 9,000 + 3,000 = 12,000 km (due now).
- Notification sent.
- User completes oil change at 12,050 km.
- Next due: 12,050 + 3,000 = 15,050 km.

**Manufacturer Defaults (pre-populated):**

| Make | Service Interval | Oil Change | Chain Lube | Brake Check | Tyre Inspection | Battery |
|------|------------------|------------|------------|-------------|-----------------|---------|
| Hero | 6,000 km / 6 mo | 3,000 km / 3 mo | 500 km / 15 d | 12,000 km / 12 mo | 18,000 km / 18 mo | 24 mo |
| Bajaj | 4,000 km / 4 mo | 4,000 km / 4 mo | 500 km / 15 d | 12,000 km / 12 mo | 18,000 km / 18 mo | 24 mo |
| TVS | 6,000 km / 6 mo | 3,000 km / 3 mo | 500 km / 15 d | 12,000 km / 12 mo | 18,000 km / 18 mo | 24 mo |
| Honda | 4,000 km / 4 mo | 4,000 km / 4 mo | 500 km / 15 d | 12,000 km / 12 mo | 18,000 km / 18 mo | 24 mo |
| Royal Enfield | 5,000 km / 6 mo | 5,000 km / 6 mo | 500 km / 15 d | 10,000 km / 12 mo | 15,000 km / 18 mo | 24 mo |

---

### 4.2 BLE Pairing (Phase 2)
**Supported Bikes (MVP):**
- TVS Apache RR310 (SmartXonnect).
- Royal Enfield Meteor 350 (Tripper).

**GATT Characteristics:**
- **Odometer:** Read odometer value (km) from custom characteristic UUID (manufacturer-specific).
- **Speed:** Real-time speed (km/h) from standard UUID `0x2A67`.
- **Battery:** Voltage (V) from UUID `0x2A19`.

**Pairing Flow:**
1. User taps "Pair Bike" in Settings.
2. App scans for BLE devices (filters by name: "TVS_*", "RE_Tripper").
3. User selects bike → OS-level pairing dialog → user confirms.
4. App subscribes to GATT notifications (odometer updates every 10 seconds).
5. If connection lost → app attempts reconnection every 30 seconds (max 3 attempts).

**Fallback:** If BLE unavailable, user manually enters odometer (no blocker).

---

### 4.3 Location Tracking
**iOS Implementation:**
- **Permissions:** Request "When In Use" first. If user agrees, request "Always Allow" with rationale: "Track trips automatically even when app is closed."
- **Mode:** Use `Significant Location Changes` (low power) + `Standard Location Updates` (high accuracy during active trip).
- **Background:** App can track in background with `UIBackgroundModes` = `location`.

**Android Implementation:**
- **Permissions:** Request `ACCESS_FINE_LOCATION` (foreground). For background, request `ACCESS_BACKGROUND_LOCATION` separately.
- **Foreground Service:** Start service with persistent notification: "RideCare is tracking your ride."
- **Battery:** Use `PRIORITY_BALANCED_POWER_ACCURACY` (balance accuracy vs. battery).

**Distance Calculation:**
- Use Haversine formula for GPS points.
- Apply Kalman filter to smooth noisy GPS data.
- Correct drift: If trip endpoint is known location (home/work), snap to that point.

---

### 4.4 Offline Mode & Sync
**Local Storage:**
- **iOS:** SQLite (via `react-native-sqlite-storage`) or Realm.
- **Android:** Same (SQLite or Realm).

**Schema:** See Section 6 (Database).

**Sync Strategy:**
1. **On app start:** If internet available, upload local changes (trips, maintenance) to Firebase.
2. **Real-time:** Use Firebase Realtime Database or Firestore for live sync (if user signed in).
3. **Conflict resolution:** Last-write-wins (timestamp-based). Show warning if data overwritten.

**Bandwidth:**
- Initial sync: <5 MB (100 trips).
- Incremental: <100 KB per trip.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **App launch:** <2 seconds (cold start on mid-range device).
- **Dashboard render:** <500 ms (100 trips in history).
- **Trip save:** <1 second (local DB write).
- **Cloud sync:** <10 seconds (100 trips upload).

### 5.2 Battery
- **8-hour tracking:** <10% battery drain (iPhone 13, Pixel 6).
- **Idle (not tracking):** <1% per day.

### 5.3 Accuracy
- **Distance:** ±5% over 100 km route.
- **Speed:** ±2 km/h (vs. bike speedometer).

### 5.4 Reliability
- **Crash-free rate:** >99.5%.
- **Notification delivery:** >95%.
- **Data loss:** 0% (local + cloud redundancy).

### 5.5 Security
- **Encryption:** TLS 1.3 for all network traffic. AES-256 for local DB (optional, user-enabled).
- **Auth:** Firebase Auth (OAuth 2.0). No passwords stored locally.
- **Privacy:** No third-party trackers. Location data never sold.

### 5.6 Compliance
- **GDPR:** Right to access (data export), right to erasure (account deletion), data minimization.
- **CCPA:** Disclosure of data collection, no sale of data.
- **App Store:** Privacy Nutrition Label (iOS 14+), permission rationale.

---

## 6. Data Model (Simplified)

### 6.1 Users
```
{
  "id": "uuid",
  "email": "rider@example.com",
  "name": "Raj Kumar",
  "created_at": "2025-11-01T10:00:00Z",
  "settings": {
    "notifications_push": true,
    "notifications_email": false,
    "theme": "dark",
    "telemetry_enabled": false
  }
}
```

### 6.2 Bikes
```
{
  "id": "uuid",
  "user_id": "uuid",
  "nickname": "My Splendor",
  "make": "Hero",
  "model": "Splendor Plus BS6",
  "year": 2023,
  "vehicle_type": "Motorcycle",
  "variant": "BS6 FI",
  "odometer_km": 12450.5,
  "bluetooth_id": null,  // BLE device ID (if paired)
  "created_at": "2025-11-01T10:30:00Z",
  "updated_at": "2025-11-04T08:45:00Z"
}
```

### 6.3 Trips
```
{
  "id": "uuid",
  "bike_id": "uuid",
  "start_time": "2025-11-04T08:00:00Z",
  "end_time": "2025-11-04T08:42:00Z",
  "start_lat": 12.9716,
  "start_lng": 77.5946,
  "end_lat": 12.9352,
  "end_lng": 77.6245,
  "distance_km": 15.3,
  "avg_speed_kmh": 32.5,
  "max_speed_kmh": 58.0,
  "path": "encoded_polyline_or_geojson",  // Compressed GPS points
  "notes": "Morning commute",
  "synced": true  // False if offline; true when uploaded
}
```

### 6.4 Maintenance Events
```
{
  "id": "uuid",
  "bike_id": "uuid",
  "type": "oil_change",  // Enum: service, oil_change, chain_lube, brake_check, tyre_inspection, battery
  "km_due_at": 18000,
  "date_due": null,  // For time-based rules (e.g., "2026-05-01")
  "notified": true,  // Has user been notified?
  "completed": false,
  "completed_at": null,
  "completed_km": null,
  "cost": null,  // ₹ or currency
  "notes": "",
  "receipt_urls": [],  // Array of Firebase Storage URLs
  "created_at": "2025-11-01T10:40:00Z"
}
```

### 6.5 Maintenance Rules (User-Defined)
```
{
  "id": "uuid",
  "bike_id": "uuid",
  "type": "oil_change",
  "interval_km": 3000,
  "interval_days": 90,
  "logic": "OR",  // "OR" = whichever first; "AND" = both must be met
  "recurring": true,
  "enabled": true
}
```

---

## 7. Third-Party Services

| Service | Purpose | Plan | Cost (Estimated) |
|---------|---------|------|------------------|
| **Firebase Auth** | User authentication (email, Google, Apple) | Spark (free) | $0 (up to 10k MAU) |
| **Firebase Firestore** | Cloud database (trips, bikes, maintenance) | Blaze (pay-as-go) | ~$25/mo (1k users) |
| **Firebase Cloud Messaging** | Push notifications (iOS + Android) | Free | $0 |
| **Firebase Storage** | Receipt uploads (images, PDFs) | Blaze | ~$5/mo (10 GB) |
| **Firebase Crashlytics** | Crash reporting | Free | $0 |
| **Mapbox** | Offline maps, polyline rendering | Free tier | $0 (50k requests/mo) |
| **Google Maps API** | Service center locator (Places API) | Pay-as-go | ~$10/mo (5k requests) |
| **Sentry** (optional) | Error monitoring (alternative to Crashlytics) | Free tier | $0 (5k events/mo) |

**Total Monthly Cost (1k users):** ~$40-50.

---

## 8. Roadmap (4 Phases)

### Phase 1: MVP (3 months, 500 dev-hours)
**Goal:** Launchable app with core features (GPS tracking, maintenance reminders, offline mode).

**Features:**
- User account (email, Google, Apple Sign-In).
- Bike onboarding wizard.
- Automatic GPS trip tracking (iOS + Android).
- Maintenance rules engine (KM-based, time-based).
- Push notifications.
- Maintenance history log.
- Offline mode (SQLite).
- Dark mode.
- Privacy controls (data export, account deletion).

**Deliverables:**
- React Native app (iOS + Android).
- Firebase backend.
- Beta release (TestFlight + Play Store Beta).

**KPIs:**
- 100 beta testers.
- >85% onboarding completion.
- <5% crash rate.
- 4.0+ rating (beta feedback).

---

### Phase 2: Beta (2 months, 300 dev-hours)
**Goal:** Refine MVP; add power-user features.

**Features:**
- BLE pairing (TVS, Royal Enfield).
- Receipt upload + OCR.
- Cost tracking & budgeting.
- Calendar integration.
- Fuel economy tracking.
- Trip history with maps.
- Service center locator.
- Cloud sync (multi-device).

**Deliverables:**
- Public beta (500 users).
- App Store + Play Store submission (review).

**KPIs:**
- 500 active users.
- >40% Day 7 retention.
- >20% Day 30 retention.
- 4.3+ rating.

---

### Phase 3: v1.0 (1 month, 200 dev-hours)
**Goal:** Public launch; scale to 10k users.

**Features:**
- Predictive maintenance (anomaly detection).
- Multi-vehicle support.
- Community tips & manuals.
- Trip sharing (social).
- Home screen widget.

**Deliverables:**
- Public launch (App Store + Play Store).
- Marketing campaign (Reddit, YouTube, Instagram).
- Press release.

**KPIs:**
- 10k downloads (Month 1).
- 2k active users (Month 1).
- 4.5+ rating.

---

### Phase 4: v1.1 (Ongoing)
**Goal:** Monetization; expand to cars.

**Features:**
- Pro subscription ($2.99/month: cloud sync, predictive, multi-vehicle).
- Fleet mode (business users).
- Voice assistant (Siri, Google Assistant).
- Car support (adapt maintenance rules).

**KPIs:**
- 5% conversion to Pro (paid users).
- $5k MRR (1k paid users).

---

## 9. Monetization Strategy

### Option 1: Freemium (Recommended)
- **Free Tier:**
  - GPS tracking (unlimited).
  - Maintenance reminders (KM-based + time-based).
  - Offline mode.
  - 1 bike.
  - Local storage only (no cloud sync).

- **Pro Tier ($2.99/month or $29.99/year):**
  - Cloud sync (multi-device).
  - Receipt upload (100 MB storage).
  - Cost tracking & budgeting.
  - Predictive maintenance.
  - Multi-vehicle support (up to 5 bikes).
  - Priority support.

**Revenue Projection (Year 1):**
- 10k users → 5% conversion → 500 paid users.
- $2.99/user/mo → $1,495/mo → **$17,940/year** (excluding annual plans).

---

### Option 2: One-Time Purchase
- **Lifetime Pro:** $49.99 (one-time).
- Pros: Lower friction (no subscription fatigue).
- Cons: Lower LTV (lifetime value).

---

### Option 3: Ad-Supported (Not Recommended)
- Free tier shows ads (banner, interstitial).
- Pros: No payment friction.
- Cons: Poor UX; conflicts with privacy-first positioning.

---

## 10. Success Metrics (Year 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Downloads** | 50k | App Store + Play Store |
| **Active Users (MAU)** | 10k | Firebase Analytics |
| **Retention (Day 7)** | 40% | Cohort analysis |
| **Retention (Day 30)** | 20% | Cohort analysis |
| **Paid Conversion** | 5% | Stripe / in-app purchase |
| **MRR (Monthly Recurring Revenue)** | $5k | Stripe |
| **NPS (Net Promoter Score)** | 50+ | In-app survey |
| **Crash-Free Rate** | >99.5% | Crashlytics |
| **App Store Rating** | 4.5+ ⭐ | Reviews |

---

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **iOS App Store rejection** (location permission) | Medium | High | Provide detailed rationale; use Significant Changes where possible. Submit early for review. |
| **Battery drain complaints** | High | High | Adaptive GPS sampling; in-app battery stats; educate users. Beta test on 20+ devices. |
| **Users forget to start trips** | Medium | Medium | Auto-start detection (speed >10 km/h). Make manual "Start Trip" button prominent. |
| **BLE pairing fails** | High (manufacturer fragmentation) | Low | Make BLE optional (not required). Offer manual odometer entry. |
| **Privacy backlash** | Low | High | Default opt-out of telemetry; transparent privacy policy; no third-party trackers. |
| **Competitors copy features** | Medium | Medium | Focus on UX excellence + community building. First-mover advantage in India market. |
| **Low conversion to paid** | Medium | Medium | Offer 14-day Pro trial. Show value (e.g., "You saved ₹5,000 by avoiding engine damage"). |

---

## 12. Open Questions (To Resolve)

1. **Should MVP include BLE pairing?**  
   → **Decision:** No. Delay to Phase 2 due to manufacturer fragmentation.

2. **Mapbox vs. Google Maps?**  
   → **Decision:** Use both. Mapbox for offline tiles + trip polylines; Google Maps for service center POI (Places API).

3. **Firebase vs. AWS?**  
   → **Decision:** Firebase (faster MVP, integrated auth/storage/push). Migrate to AWS if scale >100k users.

4. **React Native vs. Flutter?**  
   → **Decision:** React Native (better BLE + location libraries; larger community).

5. **iOS "Always Allow" location: Will App Store approve?**  
   → **Decision:** Provide very clear rationale. Use Significant Location Changes where possible. Submit early for review.

---

**End of Product Specification**

**Next:** UX/UI design artifacts (wireframes, mockups, design tokens, animations).
