# Feature Prioritization & Acceptance Criteria
**Project:** RideCare  
**Version:** 1.0  
**Last Updated:** November 4, 2025

---

## Feature Matrix (MoSCoW)

| ID | Feature | Priority | Complexity | User Value | Dev Effort | Phase | Acceptance Criteria |
|----|---------|----------|------------|------------|------------|-------|---------------------|
| F01 | User account (email/OAuth) | **Must** | Low | High | 3d | MVP | User can sign up, log in, reset password; session persists 30 days. |
| F02 | Bike onboarding wizard | **Must** | Medium | Critical | 5d | MVP | User completes 13-step wizard in <90s; bike saved to local DB. |
| F03 | GPS-based trip tracking | **Must** | High | Critical | 10d | MVP | App auto-detects trip start (>10 km/h); records path; saves trip on stop. Accuracy ±5% over 100 km. |
| F04 | Kilometer tally | **Must** | Low | Critical | 2d | MVP | Dashboard shows: today's km, week's km, lifetime km. Updates in real-time during trip. |
| F05 | Maintenance rules engine | **Must** | High | Critical | 8d | MVP | Admin or user defines rules (KM-based, time-based, sensor-based). Engine triggers notifications when thresholds met. |
| F06 | Push notifications | **Must** | Medium | High | 4d | MVP | Notifications fire at 200 km before due, 100 km, 0 km (overdue). User can snooze or mark complete. |
| F07 | Maintenance history log | **Must** | Low | High | 3d | MVP | User sees list of past/upcoming maintenance. Can add notes, mark complete, view cost. |
| F08 | Offline mode | **Must** | Medium | High | 6d | MVP | All trips and data stored in SQLite. No internet required for core functions. |
| F09 | Dark mode | **Must** | Low | Medium | 2d | MVP | System-linked or manual toggle. All screens support dark theme. |
| F10 | Privacy controls | **Must** | Medium | High | 4d | MVP | Opt-in telemetry toggle. Data export (JSON). Account deletion (GDPR). |
| F11 | BLE bike pairing | **Should** | Very High | Medium | 12d | Beta | User pairs with supported bike (TVS, RE). App reads odometer, speed via BLE GATT. Reconnection on app restart. |
| F12 | Receipt upload | **Should** | Medium | Medium | 5d | Beta | User uploads image/PDF per maintenance event. Stored in cloud (Firebase Storage). OCR extracts cost (optional). |
| F13 | Cost tracking | **Should** | Low | Medium | 3d | Beta | Dashboard shows: total spend (monthly, yearly). Charts by category (service, fuel, parts). |
| F14 | Calendar integration | **Should** | Medium | Low | 4d | Beta | Maintenance due dates sync to iOS Calendar / Google Calendar. |
| F15 | Fuel economy tracking | **Should** | Medium | Medium | 6d | Beta | User logs fuel fill-ups. App calculates km/l. Chart shows trend over time. |
| F16 | Trip history with maps | **Should** | Medium | Medium | 5d | Beta | User sees list of past trips. Tap to view route on map (Mapbox polyline). |
| F17 | Service center locator | **Should** | Medium | Low | 4d | Beta | Map view shows nearby authorized service centers (Google Places API). Tap to call or navigate. |
| F18 | Time-based reminders | **Should** | Low | Medium | 2d | Beta | User sets reminder for "6 months since last service". App notifies on date. |
| F19 | Cloud sync | **Should** | High | Medium | 8d | Beta | Optional. User signs in; data syncs to Firebase. Multi-device access. Conflict resolution (last-write-wins). |
| F20 | Predictive maintenance | **Could** | Very High | Low | 20d | v1.0 | ML model detects anomalies (vibration spike, poor fuel economy). Suggests "Check chain" or "Brake inspection". Requires 1,000+ user dataset. |
| F21 | Multi-vehicle support | **Could** | Medium | Low | 5d | v1.0 | User adds multiple bikes. Dashboard shows aggregate stats. Switch between bikes. |
| F22 | Community tips & manuals | **Could** | Low | Low | 3d | v1.0 | In-app links to manufacturer manuals (PDF). Curated YouTube videos. No UGC (legal risk). |
| F23 | Trip sharing | **Could** | Low | Low | 4d | v1.0 | User exports trip as image or link. Shareable to WhatsApp, Instagram. |
| F24 | Home screen widget | **Could** | Medium | Low | 6d | v1.0 | Widget shows: km this week, next maintenance due. iOS + Android support. |
| F25 | Voice assistant integration | **Could** | High | Low | 10d | v1.1 | User asks Siri/Google: "When is my bike service due?" App responds via Shortcuts/Actions. |

---

## Detailed Acceptance Criteria

### F01: User Account
**As a** rider,  
**I want to** create an account and log in,  
**So that** my data is secure and synced across devices.

**Acceptance Tests:**
1. User signs up with email → receives verification email → verifies → logged in.
2. User signs up with Google OAuth → redirected to Google → consent → logged in (no email verification needed).
3. User signs up with Apple Sign-In → Face ID → logged in.
4. Password reset: User clicks "Forgot Password" → receives email → resets → can log in with new password.
5. Session persists 30 days (no re-login required).
6. **Pass:** All 5 flows work on iOS + Android.

---

### F02: Bike Onboarding Wizard
**As a** new user,  
**I want to** quickly add my bike details,  
**So that** the app can set up maintenance reminders.

**Acceptance Tests:**
1. Wizard has 13 steps (see research doc).
2. User completes wizard in <90 seconds (timed).
3. Step 5 (model): "Auto-detect via Bluetooth" button appears (even if not functional in MVP—grayed out).
4. Step 10 (maintenance thresholds): Pre-filled with manufacturer defaults (e.g., Hero Splendor: 6,000 km service).
5. Wizard saves bike to SQLite; appears on dashboard.
6. User can edit bike details later (Settings > My Bikes).
7. **Pass:** 100% completion rate in usability test (10 users).

---

### F03: GPS-Based Trip Tracking
**As a** rider,  
**I want the app to automatically track my trips,  
**So that** I don't have to manually start/stop.

**Acceptance Tests:**
1. **Auto-start:** User's speed >10 km/h for 30 seconds → trip starts automatically (no manual button press).
2. **Auto-stop:** User stationary (<5 km/h) for 10 minutes → trip ends; prompts "Save trip?"
3. **Accuracy:** Over a known 100 km highway route, app reports 95–105 km (±5%).
4. **Battery:** 8-hour tracking day drains <10% battery (Pixel 6, iPhone 13).
5. **Offline:** Trip recorded without internet; syncs when online.
6. **Path recording:** GPS points saved every 5 seconds while moving; polyline reconstructed.
7. **Permissions:** iOS "Always Allow" requested with clear rationale; Android foreground service with persistent notification.
8. **Pass:** All 7 tests pass on both platforms; 90% user satisfaction in beta ("tracking worked as expected").

---

### F04: Kilometer Tally
**As a** rider,  
**I want to see how much I've ridden,  
**So that** I know when maintenance is due.

**Acceptance Tests:**
1. Dashboard shows 3 cards: **Today** (e.g., 45 km), **This Week** (203 km), **Lifetime** (12,450 km).
2. Lifetime km = odometer (from onboarding) + sum of all trips.
3. Real-time update: During active trip, dashboard increments every second.
4. Manual correction: User can edit odometer in Settings (e.g., if bike serviced and odometer reset by mechanic).
5. **Pass:** Numbers match user's bike dashboard within ±2%.

---

### F05: Maintenance Rules Engine
**As a** rider,  
**I want automatic reminders for service, oil, chain, etc.,  
**So that** I never miss critical maintenance.

**Acceptance Tests:**
1. **Rule types supported:**
   - **KM-based:** "Oil change every 6,000 km"
   - **Time-based:** "Battery check every 12 months"
   - **Recurring:** After completion, rule resets (e.g., next oil change in 6,000 km).
2. **Default rules:** Pre-populated based on bike make/model (Hero, Bajaj, TVS, Honda, RE).
3. **User customization:** User can edit thresholds (e.g., change oil interval from 6,000 to 5,000 km).
4. **Multi-type rules:** Chain maintenance = 500 km OR 15 days (whichever first).
5. **Notification triggers:** Engine checks tally every 10 km driven; fires notification if within threshold (200 km, 100 km, 0 km).
6. **Pass:** Set rule "Service at 1,000 km"; ride to 800 km → notification appears. Ride to 1,000 km → notification persists. Mark complete → notification clears; next due at 7,000 km (if interval = 6,000).

---

### F06: Push Notifications
**As a** rider,  
**I want timely reminders,  
**So that** I don't forget maintenance.

**Acceptance Tests:**
1. **Threshold notifications:** 200 km before due, 100 km before, 0 km (overdue).
2. **Notification content:** "⚠️ Oil change due in 100 km. Tap to schedule." (actionable).
3. **Snooze:** User taps "Remind me in 50 km" → notification re-appears in 50 km.
4. **Mark complete:** User taps "Done" → notification clears; maintenance marked complete in history.
5. **Multi-maintenance:** If oil + chain both due, send separate notifications (not bundled).
6. **Quiet hours:** User can set Do Not Disturb (e.g., 10 PM – 7 AM); notifications delayed.
7. **iOS/Android native:** Uses FCM (Firebase Cloud Messaging) + APNs.
8. **Pass:** 95% notification delivery rate (measured in beta); <1% user complaints about spam.

---

### F07: Maintenance History Log
**As a** rider,  
**I want to see past and upcoming maintenance,  
**So that** I can track what's been done.

**Acceptance Tests:**
1. **List view:** Shows past maintenance (completed) and upcoming (due soon, overdue).
2. **Details per event:** Type (service, oil, chain), date completed, km at completion, cost, notes, receipts (Phase 2).
3. **Sort options:** By date (newest first), by type, by cost.
4. **Add manual event:** User can log maintenance done outside app (e.g., service before app install).
5. **Edit/delete:** User can edit notes or delete event (with confirmation).
6. **Pass:** User logs 5 maintenance events; all appear correctly sorted; edit one note → saves successfully.

---

### F08: Offline Mode
**As a** rider (especially touring),  
**I want the app to work without internet,  
**So that** I can track trips in remote areas.

**Acceptance Tests:**
1. **Local storage:** All trips, bikes, maintenance events stored in SQLite (or Realm).
2. **No internet required:** Disable WiFi + cellular → record trip → trip saved locally.
3. **Background sync:** When internet available, local data syncs to cloud (Firebase) within 60 seconds.
4. **Conflict resolution:** If user edits same trip on 2 devices offline → last-write-wins (show warning).
5. **Data integrity:** No data loss during offline → online transitions (tested with airplane mode toggling).
6. **Pass:** Record 10 trips fully offline → re-enable internet → all 10 trips appear in cloud dashboard.

---

### F09: Dark Mode
**As a** rider (night riding),  
**I want a dark theme,  
**So that** the app doesn't blind me at night.

**Acceptance Tests:**
1. **Auto-detect:** App follows system theme (iOS/Android) by default.
2. **Manual toggle:** User can force Light/Dark in Settings > Appearance.
3. **All screens:** Every screen (onboarding, dashboard, trip detail, settings) has dark variant.
4. **Color contrast:** WCAG AA compliant (4.5:1 for text, 3:1 for UI elements).
5. **Map rendering:** Map tiles switch to dark style in dark mode (Mapbox dark theme).
6. **Pass:** Toggle dark mode → all screens render correctly; no white flashes; battery usage on OLED screens reduced by ~15% (measured on Galaxy S21).

---

### F10: Privacy Controls
**As a** privacy-conscious rider,  
**I want control over my data,  
**So that** I trust the app.

**Acceptance Tests:**
1. **Telemetry opt-in:** During onboarding, "Share anonymized usage data?" defaults to **NO**.
2. **Data export:** Settings > Privacy > Export Data → generates JSON file with all trips, bikes, maintenance events. Downloadable in <5 seconds.
3. **Account deletion:** Settings > Privacy > Delete Account → confirmation dialog → deletes user data from Firebase + local storage within 24 hours.
4. **Location transparency:** Settings > Privacy > Location History → shows map of all tracked trips; user can delete individual trips.
5. **No third-party tracking:** No Google Analytics, Facebook Pixel, etc. (only Firebase Crashlytics for crash reports, which is opt-in).
6. **Pass:** GDPR compliance audit; privacy policy reviewed by legal; 0 complaints in beta.

---

### F11: BLE Bike Pairing (Phase 2)
**As a** tech-savvy rider (TVS/Royal Enfield owner),  
**I want to pair my phone with my bike,  
**So that** the app reads odometer automatically.

**Acceptance Tests:**
1. **Discovery:** User taps "Pair Bike" → app scans for BLE devices → shows list (e.g., "TVS Apache RR310").
2. **Pairing:** User selects bike → BLE pairing dialog (OS-level) → paired.
3. **Read odometer:** App reads GATT characteristic (custom or standard) → displays odometer value matching bike dashboard (±10 km).
4. **Reconnection:** User closes app → opens next day → app reconnects automatically (no re-pairing).
5. **Forget device:** Settings > Bluetooth > Forget → removes pairing; user can re-pair.
6. **Fallback:** If BLE fails, user manually enters odometer (no blocker).
7. **Supported bikes:** MVP = TVS Apache RR310, Royal Enfield Meteor 350 (Tripper). Others = manual entry.
8. **Pass:** Pairing success rate >80% (tested on 10 supported bikes); odometer reading accurate within ±5%.

---

### F12: Receipt Upload (Phase 2)
**As a** meticulous rider,  
**I want to upload service receipts,  
**So that** I have proof for resale.

**Acceptance Tests:**
1. **Upload:** User taps maintenance event → "Add Receipt" → picks image/PDF from gallery or camera → uploads to Firebase Storage.
2. **Display:** Receipts shown as thumbnails in maintenance detail screen. Tap to view full-size.
3. **OCR (optional):** If receipt has clear text, extract cost and auto-fill "Cost" field (using Firebase ML Kit or Tesseract).
4. **Storage limit:** Free tier = 10 MB per user; Pro tier = 100 MB.
5. **Delete:** User can delete receipts (confirmation dialog).
6. **Pass:** Upload 5 receipts (images + PDFs) → all viewable; OCR extracts cost from 3/5 (60% accuracy acceptable for MVP).

---

### F13: Cost Tracking (Phase 2)
**As a** budget-conscious rider,  
**I want to see how much I spend on maintenance,  
**So that** I can plan expenses.

**Acceptance Tests:**
1. **Cost per event:** User enters cost (₹/currency) when logging maintenance.
2. **Dashboard card:** "Total Spend: ₹12,450 this year" (filterable by month, year, all-time).
3. **Charts:** Bar chart showing spend by category (service, oil, parts, fuel). Line chart showing monthly trend.
4. **Budget alerts:** User sets budget (e.g., ₹5,000/month) → notification if exceeded.
5. **Export:** Include costs in data export (CSV format for Excel).
6. **Pass:** Log 10 maintenance events with costs → chart renders correctly; export CSV → opens in Google Sheets.

---

### F14: Calendar Integration (Phase 2)
**As a** forgetful rider,  
**I want maintenance due dates in my calendar,  
**So that** I see them alongside work meetings.

**Acceptance Tests:**
1. **iOS:** User taps "Add to Calendar" → creates event in iOS Calendar app (default calendar or user selects).
2. **Android:** Creates event in Google Calendar (requires Calendar permission).
3. **Event details:** Title: "🔧 Oil Change Due", Date: [due date], Notes: "RideCare reminder. Current km: 12,450. Due at: 18,000."
4. **Update:** If user completes maintenance early, calendar event deleted or updated.
5. **Privacy:** User can disable calendar sync in Settings.
6. **Pass:** Create 3 maintenance events → all appear in iOS Calendar / Google Calendar; complete one → calendar event removed.

---

### F15: Fuel Economy Tracking (Phase 2)
**As a** rider optimizing costs,  
**I want to track km/l,  
**So that** I can improve riding habits.

**Acceptance Tests:**
1. **Log fill-up:** User taps "Add Fuel" → enters liters, cost, odometer reading.
2. **Calculate km/l:** App calculates (current odometer - last fill-up odometer) / liters.
3. **Display:** Dashboard card: "Fuel Economy: 42 km/l (last fill-up)". Chart shows trend over time.
4. **Alerts:** If km/l drops >10% from average → notification "Fuel economy dropped. Check tyre pressure or riding habits."
5. **Export:** Include fuel logs in data export.
6. **Pass:** Log 5 fill-ups → km/l calculated correctly (within ±1 km/l of manual calculation); chart shows upward trend.

---

### F16: Trip History with Maps (Phase 2)
**As a** touring rider,  
**I want to see my past routes,  
**So that** I can relive memories.

**Acceptance Tests:**
1. **List view:** Shows all trips (sorted by date). Each row: date, distance, duration, start location.
2. **Map view:** Tap trip → full-screen map with polyline (route). Mapbox or Google Maps.
3. **Details:** Start/end time, avg speed, max speed, km driven.
4. **Offline maps:** Download Mapbox tiles for offline viewing (Pro tier).
5. **Delete:** User can delete trips (confirmation).
6. **Pass:** Record 10 trips → view each on map → polylines match actual routes (verified with Google Maps); offline mode works.

---

### F17: Service Center Locator (Phase 2)
**As a** rider in a new city,  
**I want to find nearby service centers,  
**So that** I can get my bike serviced.

**Acceptance Tests:**
1. **Map view:** Shows pins for authorized service centers (Google Places API: search "Honda service center" near user location).
2. **Details card:** Tap pin → shows name, address, phone, rating (Google Reviews), distance from user.
3. **Actions:** "Call", "Navigate" (opens Google Maps/Apple Maps).
4. **Filter:** User can filter by make (e.g., show only Bajaj centers).
5. **Offline:** Cache last search results for offline viewing (limited to 10 centers).
6. **Pass:** Search "Honda service" in Bangalore → shows 5+ results; tap "Navigate" → Google Maps opens with directions.

---

### F18: Time-Based Reminders (Phase 2)
**As a** rider,  
**I want reminders based on time (not just km),  
**So that** battery checks (every 12 months) don't get missed.

**Acceptance Tests:**
1. **Rule creation:** User sets "Battery check every 12 months from last check".
2. **Notification:** 30 days before due, 7 days before, day of → push notifications.
3. **Combine with KM rules:** Chain maintenance = 500 km OR 15 days (whichever first).
4. **Pass:** Set time rule → fast-forward device clock 11 months → notification fires on schedule.

---

### F19: Cloud Sync (Phase 2)
**As a** multi-device rider,  
**I want my data on all devices,  
**So that** I can access from phone + tablet.

**Acceptance Tests:**
1. **Sign in:** User logs in on Device A → uploads local data to Firebase.
2. **Multi-device:** User logs in on Device B → downloads data from Firebase.
3. **Real-time sync:** User records trip on Device A → appears on Device B within 10 seconds (via WebSocket or polling).
4. **Conflict resolution:** User edits trip offline on both devices → when online, last-write-wins (timestamp-based). Show warning: "Trip updated on another device. Local changes overwritten."
5. **Bandwidth:** Initial sync <5 MB (for 100 trips + 50 maintenance events). Incremental sync <100 KB.
6. **Pass:** Test with 2 devices (iOS + Android) → data syncs correctly; no data loss; conflicts handled gracefully.

---

### F20: Predictive Maintenance (Phase 3)
**As a** proactive rider,  
**I want the app to predict issues,  
**So that** I avoid breakdowns.

**Acceptance Tests:**
1. **Anomaly detection:** App tracks rolling average of fuel economy (last 10 fill-ups). If current km/l is >15% below avg → alert "Fuel economy dropped. Possible issues: dirty air filter, low tyre pressure, chain slack."
2. **Vibration detection:** (Requires phone accelerometer + ML model). If abnormal vibration detected during ride → alert "Unusual vibration. Check chain tension or wheel balance."
3. **Data requirements:** Requires 1,000+ users and 6 months of data to train ML model.
4. **Pass:** Simulate low tyre pressure (reduce fuel economy) → alert fires correctly; 70% accuracy in beta test.

---

## Summary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Onboarding completion rate** | >85% | Analytics (Firebase) |
| **Trip tracking accuracy** | ±5% over 100 km | Real-device test |
| **Notification delivery rate** | >95% | FCM logs |
| **Battery drain** | <10% per 8h tracking | Battery stats (iOS/Android) |
| **User retention (Day 7)** | >40% | Analytics |
| **User retention (Day 30)** | >20% | Analytics |
| **Crash-free rate** | >99.5% | Firebase Crashlytics |
| **App Store rating** | >4.3 ⭐ | App Store / Play Store |
| **Support tickets** | <5% of MAU | Support dashboard |

---

**Next:** Proceed to UX/UI design artifacts (wireframes, mockups, design tokens).
