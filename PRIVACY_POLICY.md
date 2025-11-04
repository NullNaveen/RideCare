/**
 * PRIVACY_POLICY.md
 * 
 * Privacy policy draft for RideCare (GDPR/CCPA compliant)
 * Last Updated: January 2026
 */

# Privacy Policy - RideCare

**Effective Date:** January 1, 2026

## Introduction

RideCare ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our mobile application (the "App").

**Privacy-First Commitment:** RideCare is designed with offline-first architecture. Your trip data is stored locally on your device and only synced to the cloud when you explicitly enable cloud sync (Pro feature).

---

## 1. Information We Collect

### 1.1 Information You Provide
- **Account Information:** Email address, name (for authentication via Firebase)
- **Bike Information:** Make, model, registration number, purchase date
- **Maintenance Records:** Service dates, costs, receipts (photos)

### 1.2 Automatically Collected Information
- **Location Data:** GPS coordinates during trips (stored locally, synced only if cloud sync enabled)
- **Bluetooth Data:** BLE device identifiers (bike pairing) — never shared externally
- **Usage Data:** App interactions, crash reports (anonymized via Firebase Crashlytics)

### 1.3 Information We Do NOT Collect
- We do NOT track your location when the app is not in use (except iOS background tracking during active trips)
- We do NOT sell your data to third parties
- We do NOT share location data with advertisers

---

## 2. How We Use Your Information

We use collected information to:
- **Provide Services:** Track trips, calculate maintenance due dates, send notifications
- **Improve App:** Analyze usage patterns (anonymized) to fix bugs and add features
- **Customer Support:** Respond to inquiries and troubleshoot issues
- **Security:** Detect and prevent fraud or unauthorized access

---

## 3. Data Storage & Security

### 3.1 Local Storage
- Trip data is stored in an encrypted SQLite database on your device
- Receipts are stored locally (iOS: Keychain, Android: EncryptedSharedPreferences)

### 3.2 Cloud Storage (Pro Users Only)
- Cloud sync uses Firebase Firestore with encryption in transit (TLS 1.3)
- Data is stored in Google Cloud Platform data centers (region: Asia-South1 for Indian users)
- We retain cloud data for the duration of your subscription plus 30 days

### 3.3 Security Measures
- End-to-end encryption for receipts (AES-256)
- Firebase Authentication with OAuth 2.0
- Regular security audits by third-party firms

---

## 4. Data Sharing & Third Parties

We share data only in these limited circumstances:
- **Service Providers:** Firebase (Google), Mapbox for maps (see their privacy policies)
- **Legal Compliance:** If required by law or to protect user safety
- **With Your Consent:** If you explicitly authorize sharing (e.g., exporting data to a mechanic)

We do NOT sell or rent your personal information.

---

## 5. Your Rights

### GDPR (EU Users)
- **Right to Access:** Request a copy of your data
- **Right to Rectification:** Correct inaccurate data
- **Right to Erasure:** Delete your account and all data
- **Right to Data Portability:** Export data in JSON format

### CCPA (California Users)
- **Right to Know:** What data we collect and how it's used
- **Right to Delete:** Request deletion of personal information
- **Right to Opt-Out:** Opt out of data sales (we don't sell data)

**Exercise Your Rights:** Email privacy@ridecare.app

---

## 6. Children's Privacy

RideCare is not intended for users under 18. We do not knowingly collect data from minors. If you believe we have collected data from a minor, contact us immediately.

---

## 7. Location Data (iOS & Android)

### iOS
- We request "Always" location permission to enable background tracking during trips
- You can disable background tracking in Settings → Privacy → Location Services
- iOS displays a blue banner when location is being tracked

### Android
- We use a foreground service with persistent notification during trips
- You can revoke location permission anytime in Settings → Apps → RideCare

---

## 8. International Data Transfers

If you are outside India, your data may be transferred to Google Cloud Platform servers in India. We comply with GDPR Standard Contractual Clauses for EU users.

---

## 9. Data Retention

- **Free Users:** Local data retained indefinitely (you control deletion)
- **Pro Users:** Cloud data retained for subscription duration + 30 days
- **Deleted Accounts:** All cloud data permanently deleted within 90 days

---

## 10. Changes to This Policy

We may update this policy to reflect legal or product changes. We will notify you via:
- In-app notification
- Email (for material changes)

Continued use of the app after changes constitutes acceptance.

---

## 11. Contact Us

**Email:** privacy@ridecare.app  
**Address:** [Your Registered Business Address]  
**Data Protection Officer:** [DPO Name/Email if applicable]

---

## 12. Cookie Policy

RideCare does not use cookies (mobile app only). Our Firebase SDK uses device identifiers (IDFA/AAID) for analytics — you can opt out in your device settings.

---

**Last Updated:** January 1, 2026  
**Version:** 1.0.0
