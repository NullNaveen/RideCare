# RideCare - Bike Maintenance Tracker

**Version:** 1.0.0  
**Status:** Production-Ready MVP  
**Platforms:** iOS 13+, Android 10+

---

## Overview

**RideCare** is a mobile-first bike maintenance tracker that automatically reminds riders when service, oil, chain, or tyre maintenance is due—preventing costly breakdowns and extending bike lifespan.

### Key Features
- ✅ Automatic GPS trip tracking (no manual logging)
- ✅ Offline-first architecture
- ✅ BLE pairing for supported bikes
- ✅ Privacy-first design
- ✅ Battery-optimized (<10% drain/8h)

---

## Quick Start

```bash
# Clone and setup
git clone https://github.com/NullNaveen/RideCare.git
cd RideCare/mobile
npm install
cd ios && pod install && cd ..

# Run
npm run ios     # iOS
npm run android # Android
```

---

## Documentation

Comprehensive documentation in `/docs`:

1. **[Research Report](./docs/01_RESEARCH_REPORT.md)** - User research, competitive analysis (25+ sources)
2. **[Feature Prioritization](./docs/02_FEATURE_PRIORITIZATION.md)** - MoSCoW matrix, acceptance criteria
3. **[Product Spec](./docs/03_PRODUCT_SPEC.md)** - Requirements, user flows, personas
4. **[Design System](./docs/04_DESIGN_SYSTEM.md)** - Wireframes, UI tokens, animations
5. **[Technical Architecture](./docs/05_TECHNICAL_ARCHITECTURE.md)** - System design, security

**API:** OpenAPI spec at [`api/openapi.yaml`](./api/openapi.yaml)  
**Database:** Schema at [`database/schema.sql`](./database/schema.sql)

---

## Project Structure

```
RideCare/
├── docs/           # Complete documentation (research, design, architecture)
├── design/         # Design tokens (JSON)
├── api/            # OpenAPI 3.0 spec
├── database/       # SQLite schema + seed data
├── mobile/         # React Native app (TypeScript)
│   ├── src/
│   │   ├── services/     # LocationService, BLEService, MaintenanceEngine
│   │   ├── screens/      # Dashboard, Trips, Maintenance, Settings
│   │   └── components/   # Reusable UI components
│   ├── ios/        # iOS native modules
│   └── android/    # Android native modules
└── README.md
```

---

## Tech Stack

- **Frontend:** React Native 0.73 (TypeScript)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, FCM)
- **Maps:** Mapbox + Google Maps
- **Database:** SQLite (local) + Firestore (cloud)
- **BLE:** react-native-ble-plx
- **Location:** react-native-geolocation-service

---

## Monetization

**Freemium Model:**
- **Free:** Basic tracking, 1 bike, local storage
- **Pro ($2.99/mo):** Cloud sync, receipts, predictive maintenance, multi-vehicle

**Year 1 Revenue Projection:** $17,940 (500 paid users)

---

## Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| MVP | Q1 2026 | Core tracking, notifications, offline |
| Beta | Q2 2026 | BLE pairing, receipts, cloud sync |
| v1.0 | Q3 2026 | Predictive maintenance, multi-vehicle |
| v1.1 | Q4 2026 | Car support, OBD-II |

---

## Support

**Email:** support@ridecare.app  
**Issues:** [GitHub Issues](https://github.com/NullNaveen/RideCare/issues)

---

**Built with ❤️ for riders.**