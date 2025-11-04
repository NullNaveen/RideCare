# Technical Architecture: RideCare
**Version:** 1.0.0  
**Last Updated:** November 4, 2025

---

## 1. Executive Summary

RideCare is a **mobile-first, cross-platform** bike maintenance tracker built with:
- **Frontend:** React Native (iOS + Android)
- **Backend:** Firebase (Firestore, Auth, Cloud Functions, Storage, FCM)
- **Location:** Native modules (CoreLocation, Google Play Services)
- **BLE:** Native modules (CoreBluetooth, Android BluetoothGatt)
- **Maps:** Mapbox (offline tiles) + Google Maps (service centers)
- **Database:** SQLite (local), Firestore (cloud)

**Architecture Style:** Offline-first, serverless, event-driven.

---

## 2. Tech Stack Decision

### 2.1 Cross-Platform Framework: React Native

**Why React Native (vs Flutter)?**

| Criterion | React Native | Flutter | Winner |
|-----------|--------------|---------|--------|
| **BLE Libraries** | `react-native-ble-plx` (mature, 3k★) | `flutter_blue` (less mature) | RN |
| **Background Location** | `react-native-background-geolocation` (commercial-grade) | `geolocator` (good, but less battle-tested) | RN |
| **Community** | Larger (Meta-backed, 7+ years) | Growing (Google-backed, 5 years) | RN |
| **Performance** | Near-native (native UI components) | Native (Skia rendering) | Flutter (slight edge) |
| **Developer Velocity** | Hot reload, large ecosystem | Hot reload, fast compile | Tie |
| **Native Module Integration** | Easy (bridge well-documented) | Medium (platform channels) | RN |

**Conclusion:** React Native wins for **BLE + location maturity**. Flutter is viable alternative (documented in Appendix).

---

### 2.2 Backend: Firebase (Serverless)

**Why Firebase (vs AWS / Supabase)?**

| Service | Firebase | AWS | Supabase | Winner |
|---------|----------|-----|----------|--------|
| **Auth** | Built-in (email, OAuth) | Cognito (complex setup) | Built-in (Postgres-backed) | Firebase/Supabase |
| **Database** | Firestore (realtime NoSQL) | DynamoDB (NoSQL) or RDS (SQL) | Postgres (SQL, realtime) | Firestore (realtime) |
| **Push Notifications** | FCM (free, integrated) | SNS (pay-as-go) | Third-party (OneSignal) | Firebase |
| **File Storage** | Storage (GCS-backed) | S3 | Storage (S3-backed) | Tie |
| **Serverless Functions** | Cloud Functions | Lambda | Edge Functions | Tie |
| **Cost (1k users)** | ~$40/mo | ~$50-80/mo | ~$25/mo | Supabase |
| **MVP Speed** | Fastest (integrated) | Slowest (config-heavy) | Fast | Firebase |

**Conclusion:** Firebase for **MVP speed**. Migrate to Supabase (Postgres) if need complex queries (e.g., analytics) or AWS if scale >100k users.

---

### 2.3 Local Database: SQLite (Watermelon DB)

**Why SQLite (vs Realm / AsyncStorage)?**

| | SQLite (Watermelon DB) | Realm | AsyncStorage |
|---|---|---|---|
| **Performance** | Lazy loading, optimized for React Native | Fast (native) | Slow (JSON serialization) |
| **Relational** | Yes (SQL) | No (objects) | No (key-value) |
| **Offline-First** | Built-in sync primitives | Realm Sync (paid) | Manual |
| **Size** | Scales to 10k+ records | Scales well | <6 MB limit |

**Conclusion:** **Watermelon DB** (SQLite wrapper) for offline-first, large datasets (trips, maintenance).

---

### 2.4 Maps

**Primary:** **Mapbox** (offline tiles, trip polylines, dark mode).  
**Secondary:** **Google Maps** (service center POI via Places API).

**Why both?**
- Mapbox: Offline capability (critical for touring riders).
- Google Maps: Best POI data (service centers, gas stations).

**Cost:**
- Mapbox: Free (50k map views/month).
- Google Maps: $7 per 1k Places API requests.

---

## 3. System Architecture

### 3.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       USER DEVICES                          │
│  ┌─────────────────────┐       ┌─────────────────────┐     │
│  │   iOS App (RN)      │       │  Android App (RN)   │     │
│  │  - CoreLocation     │       │  - Fused Location   │     │
│  │  - CoreBluetooth    │       │  - BluetoothGatt    │     │
│  │  - SQLite (local)   │       │  - SQLite (local)   │     │
│  └──────────┬──────────┘       └──────────┬──────────┘     │
└─────────────┼──────────────────────────────┼────────────────┘
              │                              │
              └──────────────┬───────────────┘
                             │ HTTPS (TLS 1.3)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE (GCP)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firebase Auth (OAuth 2.0)                           │  │
│  │  - Email/Password, Google, Apple Sign-In             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firestore (NoSQL Database)                          │  │
│  │  - users, bikes, trips, maintenance_events           │  │
│  │  - Real-time sync via WebSocket                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud Functions (Node.js 18)                        │  │
│  │  - onTripCreated: Calculate stats, trigger notifs   │  │
│  │  - onMaintenanceDue: Send FCM push notifications    │  │
│  │  - scheduledMaintenanceCheck: Daily cron job        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud Storage (Receipt uploads)                     │  │
│  │  - /users/{userId}/receipts/{receiptId}.{jpg|pdf}   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firebase Cloud Messaging (FCM)                      │  │
│  │  - Push notifications (iOS APNs, Android)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  THIRD-PARTY SERVICES                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Mapbox     │  │ Google Maps  │  │  Crashlytics │     │
│  │ (Offline map)│  │ (Places API) │  │ (Error logs) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 Data Flow: Trip Recording

```
1. User starts riding (speed >10 km/h)
   ↓
2. Native Location Service (iOS/Android) detects movement
   ↓
3. React Native receives location updates (JS bridge)
   ↓
4. Trip manager creates new trip in SQLite (local DB)
   ↓
5. Location points buffered in memory (every 5 seconds)
   ↓
6. User stops (stationary >10 min)
   ↓
7. Trip manager calculates: distance, avg speed, polyline
   ↓
8. Trip saved to SQLite with `synced: false` flag
   ↓
9. If internet available:
   a. Upload trip to Firestore
   b. Cloud Function `onTripCreated` triggers
   c. Update bike's cumulative odometer
   d. Check maintenance rules → trigger notifications if due
   e. Mark trip as `synced: true` in SQLite
   ↓
10. If offline: Trips remain in SQLite; sync when online
```

---

### 3.3 Data Flow: Maintenance Notification

```
1. Cloud Function `scheduledMaintenanceCheck` runs daily (cron)
   ↓
2. For each user:
   a. Fetch bikes + maintenance rules
   b. Calculate: current odometer vs. due thresholds
   c. If within 200 km (or 100 km, or overdue):
      → Send FCM push notification
      → Update maintenance_event: notified = true
   ↓
3. User receives notification (iOS/Android)
   ↓
4. User taps notification → App opens to Maintenance Detail screen
   ↓
5. User marks complete:
   a. Update maintenance_event: completed = true, completed_at = now
   b. Cloud Function recalculates next due date (recurring rules)
   c. Clear notification badge
```

---

## 4. Database Schema

### 4.1 Local Database (SQLite / Watermelon DB)

**Tables:**

#### `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at INTEGER,
  synced BOOLEAN DEFAULT 0
);
```

#### `bikes`
```sql
CREATE TABLE bikes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  vehicle_type TEXT, -- 'Motorcycle', 'Scooter', 'Moped'
  variant TEXT,
  odometer_km REAL DEFAULT 0,
  bluetooth_id TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `trips`
```sql
CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  start_time INTEGER,
  end_time INTEGER,
  start_lat REAL,
  start_lng REAL,
  end_lat REAL,
  end_lng REAL,
  distance_km REAL,
  avg_speed_kmh REAL,
  max_speed_kmh REAL,
  path TEXT, -- Encoded polyline or GeoJSON (compressed)
  notes TEXT,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);
CREATE INDEX idx_trips_bike_id ON trips(bike_id);
CREATE INDEX idx_trips_start_time ON trips(start_time);
```

#### `maintenance_events`
```sql
CREATE TABLE maintenance_events (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'service', 'oil_change', 'chain_lube', 'brake_check', 'tyre_inspection', 'battery'
  km_due_at REAL,
  date_due INTEGER, -- Unix timestamp (for time-based rules)
  notified BOOLEAN DEFAULT 0,
  completed BOOLEAN DEFAULT 0,
  completed_at INTEGER,
  completed_km REAL,
  cost REAL,
  notes TEXT,
  receipt_urls TEXT, -- JSON array of Firebase Storage URLs
  created_at INTEGER,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);
CREATE INDEX idx_maintenance_bike_id ON maintenance_events(bike_id);
CREATE INDEX idx_maintenance_completed ON maintenance_events(completed);
```

#### `maintenance_rules`
```sql
CREATE TABLE maintenance_rules (
  id TEXT PRIMARY KEY,
  bike_id TEXT NOT NULL,
  type TEXT NOT NULL,
  interval_km REAL,
  interval_days INTEGER,
  logic TEXT DEFAULT 'OR', -- 'OR' = whichever first, 'AND' = both
  recurring BOOLEAN DEFAULT 1,
  enabled BOOLEAN DEFAULT 1,
  synced BOOLEAN DEFAULT 0,
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE
);
```

---

### 4.2 Cloud Database (Firestore)

**Collections:**

#### `users`
```json
{
  "id": "auto-generated-uid",
  "email": "rider@example.com",
  "name": "Raj Kumar",
  "created_at": "2025-11-01T10:00:00Z",
  "settings": {
    "notifications_push": true,
    "notifications_email": false,
    "notifications_calendar": false,
    "theme": "dark",
    "telemetry_enabled": false,
    "quiet_hours": { "start": "22:00", "end": "07:00" }
  }
}
```

#### `bikes`
```json
{
  "id": "auto-generated-id",
  "user_id": "uid",
  "nickname": "My Splendor",
  "make": "Hero",
  "model": "Splendor Plus BS6",
  "year": 2023,
  "vehicle_type": "Motorcycle",
  "variant": "BS6 FI",
  "odometer_km": 12450.5,
  "bluetooth_id": null,
  "created_at": "2025-11-01T10:30:00Z",
  "updated_at": "2025-11-04T08:45:00Z"
}
```

#### `trips`
```json
{
  "id": "auto-generated-id",
  "bike_id": "bike-id",
  "user_id": "uid",
  "start_time": "2025-11-04T08:00:00Z",
  "end_time": "2025-11-04T08:42:00Z",
  "start_lat": 12.9716,
  "start_lng": 77.5946,
  "end_lat": 12.9352,
  "end_lng": 77.6245,
  "distance_km": 15.3,
  "avg_speed_kmh": 32.5,
  "max_speed_kmh": 58.0,
  "path": "encoded_polyline",
  "notes": "Morning commute",
  "fuel_consumed_est": 0.36
}
```

#### `maintenance_events`
```json
{
  "id": "auto-generated-id",
  "bike_id": "bike-id",
  "user_id": "uid",
  "type": "oil_change",
  "km_due_at": 18000,
  "date_due": null,
  "notified": true,
  "completed": false,
  "completed_at": null,
  "completed_km": null,
  "cost": null,
  "notes": "",
  "receipt_urls": [],
  "created_at": "2025-11-01T10:40:00Z"
}
```

#### `maintenance_rules`
```json
{
  "id": "auto-generated-id",
  "bike_id": "bike-id",
  "type": "oil_change",
  "interval_km": 3000,
  "interval_days": 90,
  "logic": "OR",
  "recurring": true,
  "enabled": true
}
```

**Indexes:**
- `trips`: Composite index on `(user_id, start_time DESC)` (for trip history queries).
- `maintenance_events`: Composite index on `(bike_id, completed, km_due_at)` (for due maintenance queries).

---

## 5. API Specification (Cloud Functions)

### 5.1 Authentication

**All endpoints require Firebase Auth JWT token in header:**
```
Authorization: Bearer <firebase-id-token>
```

---

### 5.2 REST Endpoints (Firebase Cloud Functions)

#### POST `/api/trips`
**Create or update trip (bulk sync from offline).**

**Request:**
```json
{
  "trips": [
    {
      "id": "local-trip-id-123",
      "bike_id": "bike-id",
      "start_time": "2025-11-04T08:00:00Z",
      "end_time": "2025-11-04T08:42:00Z",
      "distance_km": 15.3,
      "path": "encoded_polyline",
      ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "synced_count": 1,
  "trips": [
    {
      "local_id": "local-trip-id-123",
      "firestore_id": "auto-generated-id"
    }
  ]
}
```

---

#### GET `/api/trips?bike_id={bikeId}&limit={limit}&offset={offset}`
**Fetch trip history (paginated).**

**Response:**
```json
{
  "trips": [ /* array of trip objects */ ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

#### POST `/api/maintenance/complete`
**Mark maintenance as complete.**

**Request:**
```json
{
  "maintenance_id": "maintenance-event-id",
  "completed_at": "2025-11-04T10:00:00Z",
  "completed_km": 12450,
  "cost": 850,
  "notes": "Changed oil at XYZ garage",
  "receipt_files": [ /* base64 or upload URLs */ ]
}
```

**Response:**
```json
{
  "success": true,
  "next_due_km": 15450
}
```

**Side Effect:** Cloud Function recalculates next due date for recurring rules.

---

#### POST `/api/receipts/upload`
**Upload receipt (image or PDF).**

**Request (multipart/form-data):**
```
file: <binary>
maintenance_id: <id>
```

**Response:**
```json
{
  "success": true,
  "url": "https://firebasestorage.googleapis.com/..."
}
```

---

#### GET `/api/maintenance/due?bike_id={bikeId}`
**Fetch due/overdue maintenance.**

**Response:**
```json
{
  "due_soon": [ /* maintenance events due in <200 km */ ],
  "overdue": [ /* maintenance events overdue */ ]
}
```

---

#### POST `/api/bikes`
**Create or update bike.**

**Request:**
```json
{
  "nickname": "My Splendor",
  "make": "Hero",
  "model": "Splendor Plus BS6",
  "year": 2023,
  "odometer_km": 12000
}
```

**Response:**
```json
{
  "success": true,
  "bike_id": "auto-generated-id"
}
```

**Side Effect:** Creates default maintenance rules based on manufacturer.

---

#### DELETE `/api/user/account`
**Delete user account (GDPR compliance).**

**Response:**
```json
{
  "success": true,
  "message": "Account deletion scheduled. Data will be removed within 24 hours."
}
```

**Side Effect:** Cloud Function deletes user data from Firestore + Storage.

---

### 5.3 Cloud Functions (Background)

#### `onTripCreated` (Firestore Trigger)
**Trigger:** New document in `trips` collection.

**Logic:**
1. Update bike's `odometer_km` (add trip distance).
2. Fetch maintenance rules for bike.
3. Check if any maintenance is due (compare odometer vs. `km_due_at`).
4. If due → call `sendMaintenanceNotification()`.

---

#### `onMaintenanceDue` (Firestore Trigger)
**Trigger:** `maintenance_event.notified` changes to `true`.

**Logic:**
1. Send FCM push notification to user.
2. Log notification in Firestore (`notifications` collection for history).

---

#### `scheduledMaintenanceCheck` (Cron)
**Schedule:** Daily at 9 AM (user's timezone).

**Logic:**
1. Query all bikes with maintenance rules.
2. Calculate due maintenance (km-based + time-based).
3. For each due maintenance:
   - If not yet notified → send notification, set `notified: true`.
   - If already notified + overdue → send reminder notification.

---

## 6. Security Model

### 6.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Bikes: user can CRUD their own bikes
    match /bikes/{bikeId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Trips: user can CRUD their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Maintenance: user can CRUD their own maintenance events
    match /maintenance_events/{eventId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    // Maintenance rules: user can CRUD their own rules
    match /maintenance_rules/{ruleId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/bikes/$(resource.data.bike_id)).data.user_id == request.auth.uid;
    }
  }
}
```

---

### 6.2 Cloud Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Receipts: user can upload/read their own receipts
    match /users/{userId}/receipts/{receiptId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow write: if request.resource.size < 10 * 1024 * 1024; // Max 10 MB
      allow write: if request.resource.contentType.matches('image/.*') || 
                      request.resource.contentType == 'application/pdf';
    }
  }
}
```

---

### 6.3 Encryption

**In Transit:**
- All network traffic: **TLS 1.3** (enforced by Firebase).

**At Rest:**
- Firestore: **AES-256** (default, managed by Google).
- Cloud Storage: **AES-256** (default).
- Local SQLite: **Optional** (user can enable encryption with SQLCipher; off by default for performance).

**Sensitive Data:**
- Passwords: **Never stored** (Firebase Auth handles hashing).
- Bluetooth pairing tokens: **Ephemeral** (not persisted; re-pair on app restart if needed).

---

## 7. Native Modules

### 7.1 iOS: Background Location

**Module:** `react-native-background-geolocation` (commercial, or custom native module)

**Implementation:**

**`ios/RideCareLocation/RideCareLocationManager.swift`**
```swift
import CoreLocation

@objc(RideCareLocationManager)
class RideCareLocationManager: RCTEventEmitter, CLLocationManagerDelegate {
  
  private let locationManager = CLLocationManager()
  
  override init() {
    super.init()
    locationManager.delegate = self
    locationManager.desiredAccuracy = kCLLocationAccuracyBest
    locationManager.distanceFilter = 10  // Update every 10 meters
    locationManager.allowsBackgroundLocationUpdates = true
    locationManager.pausesLocationUpdatesAutomatically = false
  }
  
  @objc func requestPermissions() {
    locationManager.requestAlwaysAuthorization()
  }
  
  @objc func startTracking() {
    locationManager.startUpdatingLocation()
    locationManager.startMonitoringSignificantLocationChanges()
  }
  
  @objc func stopTracking() {
    locationManager.stopUpdatingLocation()
    locationManager.stopMonitoringSignificantLocationChanges()
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else { return }
    
    sendEvent(withName: "locationUpdate", body: [
      "latitude": location.coordinate.latitude,
      "longitude": location.coordinate.longitude,
      "speed": location.speed,  // m/s
      "timestamp": location.timestamp.timeIntervalSince1970
    ])
  }
  
  override func supportedEvents() -> [String]! {
    return ["locationUpdate"]
  }
}
```

**`Info.plist` (Permission Rationale):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>RideCare needs your location to track trips while using the app.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>RideCare needs your location even when the app is closed to automatically track trips and remind you of maintenance based on distance traveled.</string>

<key>UIBackgroundModes</key>
<array>
  <string>location</string>
</array>
```

---

### 7.2 Android: Foreground Service + Background Location

**Module:** Custom native module + `react-native-background-actions`

**Implementation:**

**`android/app/src/main/java/com/ridecare/LocationService.kt`**
```kotlin
package com.ridecare

import android.app.*
import android.content.Intent
import android.location.Location
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*

class LocationService : Service() {
  
  private lateinit var fusedLocationClient: FusedLocationProviderClient
  private lateinit var locationCallback: LocationCallback
  
  override fun onCreate() {
    super.onCreate()
    fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
    
    locationCallback = object : LocationCallback() {
      override fun onLocationResult(locationResult: LocationResult) {
        for (location in locationResult.locations) {
          // Send location update to React Native via EventEmitter
          sendLocationUpdate(location)
        }
      }
    }
  }
  
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    startForeground(1, createNotification())
    startLocationUpdates()
    return START_STICKY
  }
  
  private fun startLocationUpdates() {
    val locationRequest = LocationRequest.create().apply {
      interval = 5000  // 5 seconds
      fastestInterval = 1000  // 1 second
      priority = LocationRequest.PRIORITY_HIGH_ACCURACY
    }
    
    fusedLocationClient.requestLocationUpdates(
      locationRequest,
      locationCallback,
      null
    )
  }
  
  private fun createNotification(): Notification {
    val channelId = "ridecare_tracking"
    val notificationChannel = NotificationChannel(
      channelId,
      "Trip Tracking",
      NotificationManager.IMPORTANCE_LOW
    )
    val notificationManager = getSystemService(NotificationManager::class.java)
    notificationManager.createNotificationChannel(notificationChannel)
    
    return NotificationCompat.Builder(this, channelId)
      .setContentTitle("RideCare")
      .setContentText("Tracking your ride")
      .setSmallIcon(R.drawable.ic_notification)
      .setOngoing(true)
      .build()
  }
  
  private fun sendLocationUpdate(location: Location) {
    // Use React Native EventEmitter (bridge)
    val params = Arguments.createMap().apply {
      putDouble("latitude", location.latitude)
      putDouble("longitude", location.longitude)
      putDouble("speed", location.speed.toDouble())
      putDouble("timestamp", location.time.toDouble())
    }
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("locationUpdate", params)
  }
  
  override fun onBind(intent: Intent?): IBinder? = null
}
```

**`AndroidManifest.xml`:**
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<service
  android:name=".LocationService"
  android:foregroundServiceType="location"
  android:exported="false" />
```

---

### 7.3 BLE (iOS + Android)

**Library:** `react-native-ble-plx`

**Example Usage:**
```javascript
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

// Scan for BLE devices
manager.startDeviceScan(null, null, (error, device) => {
  if (device.name === 'TVS_Apache_RR310') {
    manager.stopDeviceScan();
    connectToDevice(device);
  }
});

// Connect and read GATT characteristics
async function connectToDevice(device) {
  await device.connect();
  await device.discoverAllServicesAndCharacteristics();
  
  // Read odometer (custom UUID, manufacturer-specific)
  const odometer = await device.readCharacteristicForService(
    'SERVICE_UUID',
    'ODOMETER_CHARACTERISTIC_UUID'
  );
  
  // Decode base64 value
  const odometerKm = decodeOdometer(odometer.value);
  console.log('Odometer:', odometerKm, 'km');
}
```

---

## 8. Offline-First Sync Strategy

### 8.1 Conflict Resolution

**Strategy:** Last-Write-Wins (timestamp-based).

**Logic:**
1. Each record has `updated_at` timestamp (Unix epoch, milliseconds).
2. On sync conflict (same record edited on 2 devices offline):
   - Compare `updated_at` timestamps.
   - Keep record with **latest** timestamp.
   - Overwrite local record if cloud is newer (show warning to user).

**Warning Message:**
> "⚠️ Trip 'Morning Commute' was updated on another device. Local changes overwritten."

**Alternative (Future):** Operational Transform (OT) or CRDTs for complex merges (overkill for MVP).

---

### 8.2 Sync Queue

**Implementation:**

**`services/SyncService.js`**
```javascript
class SyncService {
  async syncPendingChanges() {
    const unsyncedTrips = await db.trips.query(
      Q.where('synced', false)
    ).fetch();
    
    for (const trip of unsyncedTrips) {
      try {
        const response = await api.post('/api/trips', {
          trips: [trip.toJSON()]
        });
        
        // Mark as synced
        await trip.update(t => { t.synced = true; });
      } catch (error) {
        console.error('Sync failed:', error);
        // Retry later (exponential backoff)
      }
    }
  }
}
```

**Trigger:** Sync on:
1. App launch (if online).
2. Network reconnection (NetInfo listener).
3. Manual pull-to-refresh.

---

## 9. Battery Optimization

### 9.1 Adaptive GPS Sampling

**Strategy:**
- **High frequency (1s):** When speed >20 km/h (highway).
- **Medium frequency (5s):** When speed 10-20 km/h (city).
- **Low frequency (30s):** When speed <10 km/h (stationary).
- **Paused:** When stationary >10 min at known location (home/work).

**Implementation:**
```javascript
function adjustSamplingRate(speed) {
  if (speed > 20) {
    return 1000;  // 1 second
  } else if (speed > 10) {
    return 5000;  // 5 seconds
  } else {
    return 30000;  // 30 seconds
  }
}
```

---

### 9.2 Geofencing (Learn Home/Work)

**Strategy:** After 7 days, learn locations where user spends >6 hours (home/work).

**Logic:**
1. Create geofence (radius: 100m) around learned locations.
2. When user enters geofence + stationary >10 min → pause GPS tracking.
3. When user exits geofence → resume tracking.

---

## 10. CI/CD Pipeline

### 10.1 GitHub Actions Workflow

**`.github/workflows/ci.yml`**
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test  # Jest unit tests
      - run: npm run lint  # ESLint
  
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: cd ios && pod install
      - run: npx react-native build-ios --configuration Release
      - uses: actions/upload-artifact@v3
        with:
          name: ios-build
          path: ios/build/RideCare.ipa
  
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: 11
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: cd android && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v3
        with:
          name: android-build
          path: android/app/build/outputs/apk/release/app-release.apk
```

---

### 10.2 Deployment

**iOS (TestFlight):**
1. Build via Xcode Cloud or GitHub Actions.
2. Upload `.ipa` to App Store Connect via Transporter.
3. Submit for TestFlight review (1-2 days).

**Android (Play Store Beta):**
1. Build signed APK/AAB via Gradle.
2. Upload to Play Console → Beta track.
3. Auto-publish to beta testers.

---

## 11. Monitoring & Analytics

### 11.1 Crashlytics (Firebase)

**Setup:**
```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// Log non-fatal errors
try {
  riskyOperation();
} catch (error) {
  crashlytics().recordError(error);
}

// Custom logs
crashlytics().log('User started trip');
```

---

### 11.2 Analytics (Firebase Analytics)

**Events to Track:**
- `app_open`
- `onboarding_complete`
- `trip_start`
- `trip_end`
- `maintenance_complete`
- `notification_received`
- `ble_pairing_success` / `ble_pairing_failed`

**Example:**
```javascript
import analytics from '@react-native-firebase/analytics';

analytics().logEvent('trip_start', {
  bike_id: bikeId,
  odometer_km: odometerKm,
});
```

---

## 12. Testing Strategy

### 12.1 Unit Tests (Jest)

**Coverage Target:** >80% for business logic (maintenance rules, distance calculations).

**Example:**
```javascript
// __tests__/MaintenanceEngine.test.js
import { MaintenanceEngine } from '../services/MaintenanceEngine';

describe('MaintenanceEngine', () => {
  it('should trigger notification 200 km before due', () => {
    const engine = new MaintenanceEngine();
    const result = engine.checkDue({
      type: 'oil_change',
      km_due_at: 18000,
      current_odometer: 17800,
    });
    
    expect(result.should_notify).toBe(true);
    expect(result.threshold).toBe('200_km_before');
  });
});
```

---

### 12.2 Integration Tests (Detox)

**Test Scenarios:**
1. Onboarding flow (13 steps).
2. Trip recording (mock location updates).
3. Maintenance reminder (push notification tap).
4. Offline sync (airplane mode toggle).

**Example:**
```javascript
describe('Onboarding', () => {
  it('should complete onboarding in <90 seconds', async () => {
    await element(by.id('get-started-button')).tap();
    await element(by.id('nickname-input')).typeText('My Splendor');
    // ... (13 steps)
    await element(by.id('finish-button')).tap();
    await expect(element(by.id('dashboard'))).toBeVisible();
  });
});
```

---

### 12.3 Real-Device Testing

**Mandatory:** BLE + background location must be tested on physical devices (simulators unreliable).

**Test Matrix:**
- iOS: iPhone 13 (iOS 17), iPhone SE (iOS 15).
- Android: Pixel 6 (Android 13), Samsung Galaxy A52 (Android 11).

---

## 13. Scalability Considerations

**Current Architecture:** Handles 10k users, 500k trips.

**Bottlenecks at 100k users:**
1. **Firestore Reads:** Expensive (trips queries). → Migrate to Postgres (Supabase) with indexes.
2. **Cloud Functions Cold Starts:** → Pre-warm functions or use Cloud Run.
3. **FCM Rate Limits:** → Batch notifications (max 500 devices per request).

**Mitigation:**
- Cache frequently accessed data (bikes, rules) in Redis.
- Use CDN (Cloudflare) for static assets (maps tiles).
- Horizontally scale Cloud Functions (auto-scaling enabled by default).

---

**End of Technical Architecture**

**Next:** API specification (OpenAPI 3.0 YAML), then React Native code skeleton.
