# UX/UI Design System: RideCare
**Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Design Language:** Modern, Clean, Rider-Focused

---

## 1. Design Principles

1. **Clarity First:** Every screen should have ONE primary action. No clutter.
2. **Fast & Responsive:** Animations <300ms. No janky scrolling.
3. **Accessible:** WCAG AA compliant. Support screen readers, large text, color blindness.
4. **Battery-Conscious:** Dark mode by default (OLED savings). Minimize wake locks.
5. **Offline-Ready:** Show cached data; never white screens or spinners when offline.

---

## 2. Design Tokens

### 2.1 Color Palette

#### Primary Colors
```json
{
  "primary": {
    "50": "#E3F2FD",
    "100": "#BBDEFB",
    "200": "#90CAF9",
    "300": "#64B5F6",
    "400": "#42A5F5",
    "500": "#2196F3",  // Primary brand color
    "600": "#1E88E5",
    "700": "#1976D2",
    "800": "#1565C0",
    "900": "#0D47A1"
  }
}
```

#### Secondary Colors (Accent)
```json
{
  "secondary": {
    "50": "#FFF3E0",
    "100": "#FFE0B2",
    "200": "#FFCC80",
    "300": "#FFB74D",
    "400": "#FFA726",
    "500": "#FF9800",  // Accent for CTAs, warnings
    "600": "#FB8C00",
    "700": "#F57C00",
    "800": "#EF6C00",
    "900": "#E65100"
  }
}
```

#### Semantic Colors
```json
{
  "success": "#4CAF50",  // Green (maintenance completed)
  "warning": "#FF9800",  // Orange (due soon)
  "error": "#F44336",    // Red (overdue)
  "info": "#2196F3"      // Blue (general info)
}
```

#### Neutrals (Light Mode)
```json
{
  "neutral": {
    "0": "#FFFFFF",    // Background
    "50": "#FAFAFA",   // Surface
    "100": "#F5F5F5",  // Card background
    "200": "#EEEEEE",  // Border light
    "300": "#E0E0E0",  // Border
    "400": "#BDBDBD",  // Disabled
    "500": "#9E9E9E",  // Secondary text
    "600": "#757575",  // Body text
    "700": "#616161",  // Heading text
    "800": "#424242",  // Dark text
    "900": "#212121"   // Black
  }
}
```

#### Neutrals (Dark Mode)
```json
{
  "neutralDark": {
    "0": "#121212",    // Background (true black for OLED)
    "50": "#1E1E1E",   // Surface
    "100": "#2C2C2C",  // Card background
    "200": "#3A3A3A",  // Border light
    "300": "#484848",  // Border
    "400": "#5F5F5F",  // Disabled
    "500": "#7A7A7A",  // Secondary text
    "600": "#A0A0A0",  // Body text
    "700": "#C5C5C5",  // Heading text
    "800": "#E0E0E0",  // Light text
    "900": "#FFFFFF"   // White
  }
}
```

#### Gradients
```json
{
  "gradients": {
    "primary": "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    "success": "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
    "warning": "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
  }
}
```

---

### 2.2 Typography

#### Font Families
- **Primary:** Inter (sans-serif) — clean, modern, excellent readability.
- **Monospace:** JetBrains Mono — for numeric data (km, speed).

#### Type Scale (iOS-style, 16px base)
```json
{
  "typography": {
    "display1": {
      "fontSize": 34,
      "lineHeight": 41,
      "fontWeight": "700",
      "letterSpacing": 0.37,
      "use": "Large titles (onboarding)"
    },
    "title1": {
      "fontSize": 28,
      "lineHeight": 34,
      "fontWeight": "600",
      "letterSpacing": 0.36,
      "use": "Screen titles"
    },
    "title2": {
      "fontSize": 22,
      "lineHeight": 28,
      "fontWeight": "600",
      "letterSpacing": 0.35,
      "use": "Section headings"
    },
    "title3": {
      "fontSize": 20,
      "lineHeight": 25,
      "fontWeight": "600",
      "letterSpacing": 0.38,
      "use": "Card titles"
    },
    "body": {
      "fontSize": 16,
      "lineHeight": 24,
      "fontWeight": "400",
      "letterSpacing": 0,
      "use": "Body text"
    },
    "bodyBold": {
      "fontSize": 16,
      "lineHeight": 24,
      "fontWeight": "600",
      "letterSpacing": 0,
      "use": "Emphasized text"
    },
    "caption": {
      "fontSize": 14,
      "lineHeight": 20,
      "fontWeight": "400",
      "letterSpacing": 0,
      "use": "Secondary text, labels"
    },
    "captionBold": {
      "fontSize": 14,
      "lineHeight": 20,
      "fontWeight": "600",
      "letterSpacing": 0,
      "use": "Form labels"
    },
    "overline": {
      "fontSize": 12,
      "lineHeight": 16,
      "fontWeight": "700",
      "letterSpacing": 1.5,
      "textTransform": "uppercase",
      "use": "Category labels"
    },
    "button": {
      "fontSize": 16,
      "lineHeight": 24,
      "fontWeight": "600",
      "letterSpacing": 0.5,
      "use": "Button text"
    }
  }
}
```

#### Accessibility
- Minimum font size: 14px (support iOS Dynamic Type / Android Scaled Text).
- Line height: 1.5× font size (WCAG guideline).
- Color contrast: 4.5:1 for text, 3:1 for UI elements (AA compliant).

---

### 2.3 Spacing

**8px Grid System** (iOS/Android standard)

```json
{
  "spacing": {
    "xs": 4,    // 0.25rem (tight padding, icon gaps)
    "sm": 8,    // 0.5rem (small padding, list item gaps)
    "md": 16,   // 1rem (default card padding, margins)
    "lg": 24,   // 1.5rem (section spacing)
    "xl": 32,   // 2rem (screen padding)
    "2xl": 48,  // 3rem (large gaps)
    "3xl": 64   // 4rem (hero sections)
  }
}
```

#### Layout Rules
- **Screen padding (horizontal):** 16px (md).
- **Card padding (internal):** 16px (md).
- **Card margin (vertical):** 12px (between cards).
- **Section spacing:** 24px (lg).

---

### 2.4 Shadows & Elevation

**Material Design-inspired (subtle, iOS-friendly)**

```json
{
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.06)",       // Subtle (input fields)
    "md": "0 4px 6px rgba(0,0,0,0.1)",        // Cards
    "lg": "0 10px 15px rgba(0,0,0,0.15)",     // Modals
    "xl": "0 20px 25px rgba(0,0,0,0.2)",      // Floating buttons
    "inner": "inset 0 2px 4px rgba(0,0,0,0.1)" // Pressed state
  }
}
```

#### Dark Mode Adjustments
- Reduce shadow opacity by 50% (dark backgrounds don't need heavy shadows).
- Use subtle elevation with border highlights instead (1px border with `rgba(255,255,255,0.1)`).

---

### 2.5 Border Radius

```json
{
  "borderRadius": {
    "sm": 4,    // Input fields
    "md": 8,    // Cards, buttons
    "lg": 12,   // Modals
    "xl": 16,   // Bottom sheets
    "full": 9999 // Circular (avatars, FAB)
  }
}
```

---

### 2.6 Icons

**Icon Library:** React Native Vector Icons (Material Icons + Ionicons)

**Sizes:**
- Small: 16px (inline icons)
- Medium: 24px (buttons, list items)
- Large: 32px (feature icons)
- Hero: 48px (empty states)

**Stroke Width:** 2px (consistent with Material Design).

**Common Icons:**
- **Home:** `home` (dashboard)
- **Trip:** `map-marker-path` (trip history)
- **Maintenance:** `wrench` (service)
- **Settings:** `cog` (settings)
- **Notification:** `bell` (alerts)
- **BLE:** `bluetooth` (pairing)

---

## 3. Component Library

### 3.1 Buttons

#### Primary Button
```jsx
<TouchableOpacity
  style={{
    backgroundColor: '#2196F3', // primary.500
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  }}
  activeOpacity={0.8}
>
  <Text style={{
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }}>
    Get Started
  </Text>
</TouchableOpacity>
```

**States:**
- Default: `primary.500` background.
- Pressed: `primary.700` + `shadowInner`.
- Disabled: `neutral.400` + 50% opacity.

---

#### Secondary Button (Outlined)
```jsx
<TouchableOpacity
  style={{
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  }}
>
  <Text style={{
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  }}>
    Learn More
  </Text>
</TouchableOpacity>
```

---

#### Floating Action Button (FAB)
```jsx
<TouchableOpacity
  style={{
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  }}
>
  <Icon name="plus" size={24} color="#FFFFFF" />
</TouchableOpacity>
```

---

### 3.2 Cards

#### Standard Card
```jsx
<View
  style={{
    backgroundColor: '#FFFFFF', // Light mode; '#1E1E1E' in dark
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  }}
>
  {/* Card content */}
</View>
```

---

#### Hero Card (Dashboard)
```jsx
<View
  style={{
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  }}
>
  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
    Hero Splendor Plus BS6
  </Text>
  <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '700', marginTop: 8 }}>
    12,450 km
  </Text>
  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
    Current Odometer
  </Text>
</View>
```

---

### 3.3 Input Fields

#### Text Input
```jsx
<TextInput
  style={{
    backgroundColor: '#F5F5F5', // Light mode
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  }}
  placeholder="Enter bike nickname"
  placeholderTextColor="#9E9E9E"
/>
```

**States:**
- Focus: `borderColor: primary.500`, `borderWidth: 2`.
- Error: `borderColor: error`, show error text below.

---

### 3.4 Modals

#### Bottom Sheet (iOS-style)
```jsx
<View
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  }}
>
  {/* Handle bar (visual affordance for swipe-down) */}
  <View
    style={{
      width: 40,
      height: 4,
      backgroundColor: '#E0E0E0',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    }}
  />
  {/* Modal content */}
</View>
```

---

### 3.5 Lists

#### Trip List Item
```jsx
<TouchableOpacity
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 6,
  }}
>
  {/* Icon */}
  <View
    style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E3F2FD',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Icon name="map-marker-path" size={20} color="#2196F3" />
  </View>

  {/* Text */}
  <View style={{ flex: 1, marginLeft: 12 }}>
    <Text style={{ fontSize: 16, fontWeight: '600', color: '#212121' }}>
      Morning Commute
    </Text>
    <Text style={{ fontSize: 14, color: '#757575', marginTop: 2 }}>
      15.3 km • 42 min
    </Text>
  </View>

  {/* Chevron */}
  <Icon name="chevron-right" size={20} color="#BDBDBD" />
</TouchableOpacity>
```

---

### 3.6 Progress Indicators

#### Circular Progress (Maintenance Due)
```jsx
<Svg width={80} height={80}>
  {/* Background circle */}
  <Circle
    cx={40}
    cy={40}
    r={32}
    stroke="#E0E0E0"
    strokeWidth={8}
    fill="none"
  />
  {/* Progress circle (animated) */}
  <Circle
    cx={40}
    cy={40}
    r={32}
    stroke="#FF9800"  // warning color
    strokeWidth={8}
    strokeDasharray={`${progress} ${200 - progress}`}
    strokeLinecap="round"
    fill="none"
    transform="rotate(-90 40 40)"
  />
</Svg>
<Text style={{ fontSize: 14, fontWeight: '600', marginTop: 8 }}>
  450 km left
</Text>
```

---

## 4. Wireframes (ASCII Art + Descriptions)

### 4.1 Onboarding: Welcome Screen

```
┌─────────────────────────────┐
│  [Logo]                     │
│                             │
│   Welcome to RideCare       │
│                             │
│   [Hero Image: Rider]       │
│                             │
│   Never miss maintenance    │
│   again. Track your bike    │
│   effortlessly.             │
│                             │
│                             │
│   [Get Started] (Primary)   │
│                             │
│   Already have account?     │
│   Sign In                   │
└─────────────────────────────┘
```

**Details:**
- Hero image: Illustration of rider on bike with phone on mount (color: primary gradient).
- "Get Started" button: Full width, primary color, 48dp height.
- "Sign In" link: Caption text, underlined.

---

### 4.2 Dashboard (Home)

```
┌─────────────────────────────┐
│ ☰  RideCare          [👤]  │ ← Top bar
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  Hero Splendor Plus BS6 │ │ ← Hero card (gradient)
│ │  12,450 km              │ │
│ │  Current Odometer       │ │
│ └─────────────────────────┘ │
│                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │Today │ │ Week │ │Service│ │ ← Quick stats (horizontal scroll)
│ │45 km │ │203km │ │ 450km│ │
│ └──────┘ └──────┘ └──────┘ │
│                             │
│ Maintenance Alerts          │
│ ┌─────────────────────────┐ │
│ │ ⚠️ Oil change in 100 km │ │ ← Alert card (warning color)
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ✅ Chain lubed 2 days ago│ │ ← Completed (success color)
│ └─────────────────────────┘ │
│                             │
│ Trip History                │
│ ┌─────────────────────────┐ │
│ │ 🗺️ Morning • 18 km  →  │ │ ← Trip item
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🗺️ Evening • 27 km  →  │ │
│ └─────────────────────────┘ │
│                             │
│                      [+]    │ ← FAB (start trip manually)
└─────────────────────────────┘
```

**Interactions:**
- Tap hero card → Edit bike details.
- Swipe left on alert card → "Mark Complete" / "Snooze".
- Tap trip item → Trip detail screen.
- Pull down → Refresh (sync cloud data).

---

### 4.3 Trip Detail

```
┌─────────────────────────────┐
│ ← Trip Detail        [...] │ ← Back button, overflow menu
├─────────────────────────────┤
│                             │
│   [Map with polyline]       │ ← Full-width map (Mapbox)
│                             │
├─────────────────────────────┤
│ Morning Commute             │ ← Trip name (editable)
│ Nov 4, 2025 • 8:00 AM      │
│                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │15.3km│ │32km/h│ │58km/h│ │ ← Stats cards
│ │Dist. │ │Avg   │ │Max   │ │
│ └──────┘ └──────┘ └──────┘ │
│                             │
│ Notes                       │
│ ┌─────────────────────────┐ │
│ │ Smooth ride, no traffic │ │ ← Text area
│ └─────────────────────────┘ │
│                             │
│ [Share]        [Delete]     │ ← Action buttons
└─────────────────────────────┘
```

---

### 4.4 Maintenance History

```
┌─────────────────────────────┐
│ ← Maintenance               │
├─────────────────────────────┤
│ [Upcoming] [Completed] [All]│ ← Tabs
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ 🛠️ Service               │ │ ← Maintenance card
│ │ Due in 450 km           │ │
│ │ Expected: Nov 20, 2025  │ │
│ │ [Mark Complete]         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔧 Oil Change           │ │
│ │ OVERDUE by 50 km        │ │ ← Red badge
│ │ [Schedule Now]          │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⛓️ Chain Lube           │ │
│ │ ✅ Completed 2 days ago │ │
│ │ Next: 250 km            │ │
│ └─────────────────────────┘ │
│                             │
│                      [+]    │ ← FAB (add manual maintenance)
└─────────────────────────────┘
```

---

### 4.5 Settings

```
┌─────────────────────────────┐
│ ← Settings                  │
├─────────────────────────────┤
│ Account                     │
│ ┌─────────────────────────┐ │
│ │ 👤 Raj Kumar           →│ │
│ │ rider@example.com      →│ │
│ └─────────────────────────┘ │
│                             │
│ My Bikes                    │
│ ┌─────────────────────────┐ │
│ │ 🏍️ Hero Splendor       →│ │
│ └─────────────────────────┘ │
│                             │
│ Notifications               │
│ ┌─────────────────────────┐ │
│ │ Push     [Toggle: ON]  │ │
│ │ Email    [Toggle: OFF] │ │
│ └─────────────────────────┘ │
│                             │
│ Appearance                  │
│ ┌─────────────────────────┐ │
│ │ Theme    [Dark ▼]      │ │
│ └─────────────────────────┘ │
│                             │
│ Privacy                     │
│ ┌─────────────────────────┐ │
│ │ Data Export            →│ │
│ │ Delete Account         →│ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 5. Animation Specifications

### 5.1 Pairing Pulse (BLE Scanning)

**Purpose:** Indicate Bluetooth scanning is active.  
**Trigger:** User taps "Pair Bike" button.  
**Duration:** 1200ms (loop continuously until device found).  
**Easing:** `ease-in-out`.

**Implementation:**
```javascript
// React Native Animated API
const pulseAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
  <Icon name="bluetooth" size={48} color="#2196F3" />
</Animated.View>
```

**Fallback:** Static spinner (ActivityIndicator) on low-power devices.

---

### 5.2 Distance Milestone Celebration

**Purpose:** Celebrate when user reaches a milestone (e.g., 1,000 km tracked).  
**Trigger:** Trip save pushes total km past milestone (1k, 5k, 10k, etc.).  
**Duration:** 900ms (confetti emitter) + 300ms (modal slide-up).  
**Easing:** `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design standard).

**Implementation:**
```javascript
// Use react-native-confetti-cannon
import ConfettiCannon from 'react-native-confetti-cannon';

<ConfettiCannon
  count={50}
  origin={{ x: screenWidth / 2, y: 0 }}
  fadeOut={true}
  duration={900}
/>

// Modal slides from bottom
Animated.timing(modalAnim, {
  toValue: 0,
  duration: 300,
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  useNativeDriver: true,
}).start();
```

**Content:** Modal shows: "🎉 1,000 km tracked! You're crushing it. Next service in 450 km."

---

### 5.3 Trip Start Animation

**Purpose:** Show user that trip tracking has started.  
**Trigger:** Auto-start (speed >10 km/h) or manual "Start Trip" tap.  
**Duration:** 600ms (map zoom) + dot animation (continuous).  
**Easing:** `ease-out` (map zoom), `linear` (dot movement).

**Implementation:**
```javascript
// Map zoom animation (Mapbox)
mapRef.current.animateToRegion({
  latitude: currentLat,
  longitude: currentLng,
  latitudeDelta: 0.01,  // Zoom in
  longitudeDelta: 0.01,
}, 600);

// Dot animation (user location marker)
// Show pulsing blue dot + expanding ripple
<Animated.View style={{
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#2196F3',
  transform: [{ scale: dotAnim }]  // Pulse from 1 to 1.3
}} />
```

**Visual:** Blue dot on map with expanding ripple (like Google Maps).

---

### 5.4 Maintenance Card Flip

**Purpose:** Reveal maintenance history details on tap.  
**Trigger:** User taps maintenance card.  
**Duration:** 400ms.  
**Easing:** `cubic-bezier(0.4, 0.0, 0.2, 1)`.

**Implementation:**
```javascript
// 3D flip animation
const flipAnim = useRef(new Animated.Value(0)).current;

const flipCard = () => {
  Animated.timing(flipAnim, {
    toValue: 180,
    duration: 400,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    useNativeDriver: true,
  }).start();
};

const frontInterpolate = flipAnim.interpolate({
  inputRange: [0, 180],
  outputRange: ['0deg', '180deg'],
});

const backInterpolate = flipAnim.interpolate({
  inputRange: [0, 180],
  outputRange: ['180deg', '360deg'],
});

// Front side (summary)
<Animated.View style={{ transform: [{ rotateY: frontInterpolate }] }}>
  {/* Card front content */}
</Animated.View>

// Back side (details)
<Animated.View style={{ transform: [{ rotateY: backInterpolate }], position: 'absolute' }}>
  {/* Card back content (history, receipts) */}
</Animated.View>
```

---

### 5.5 Pull-to-Refresh

**Purpose:** Sync data from cloud.  
**Trigger:** User pulls down on dashboard or trip history.  
**Duration:** Spinner until sync complete (<5 seconds).  
**Easing:** Spring (elastic bounce).

**Implementation:**
```javascript
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#2196F3"  // Spinner color
    />
  }
>
  {/* Content */}
</ScrollView>
```

---

### 5.6 FAB Expand (Multi-Action)

**Purpose:** Show multiple quick actions from FAB.  
**Trigger:** User taps FAB on dashboard.  
**Duration:** 300ms (staggered).  
**Easing:** `ease-out-back` (slight overshoot).

**Implementation:**
```javascript
// FAB expands into 3 mini-FABs
const fabActions = [
  { icon: 'map-marker-plus', label: 'Start Trip' },
  { icon: 'wrench', label: 'Add Maintenance' },
  { icon: 'fuel', label: 'Log Fuel' },
];

// Animate each mini-FAB with stagger (100ms delay per item)
fabActions.forEach((action, index) => {
  Animated.timing(fabAnims[index], {
    toValue: 1,
    duration: 300,
    delay: index * 100,
    easing: Easing.out(Easing.back(1.5)),  // Overshoot
    useNativeDriver: true,
  }).start();
});
```

---

### 5.7 Notification Badge Pulse

**Purpose:** Draw attention to new maintenance alert.  
**Trigger:** New notification arrives (foreground).  
**Duration:** 800ms (single pulse).  
**Easing:** `ease-in-out`.

**Implementation:**
```javascript
// Badge on tab bar icon
<Animated.View style={{
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#F44336',  // Red
  position: 'absolute',
  top: 0,
  right: 0,
  transform: [{ scale: badgeAnim }]  // Pulse 1 → 1.5 → 1
}} />
```

---

### 5.8 Skeleton Loading (Offline → Online Transition)

**Purpose:** Show placeholder while data loads from cloud.  
**Trigger:** App regains internet after offline period.  
**Duration:** Until data loaded (<2 seconds).  
**Easing:** Shimmer effect (linear gradient moves left-to-right).

**Implementation:**
```javascript
// Use react-native-shimmer-placeholder
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

<ShimmerPlaceholder
  style={{ width: '100%', height: 80, borderRadius: 8, marginVertical: 8 }}
  shimmerColors={['#E0E0E0', '#F5F5F5', '#E0E0E0']}
  duration={1200}
/>
```

---

## 6. Accessibility Guidelines

### 6.1 Screen Reader Support

**React Native Accessibility Props:**
```jsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start Trip"
  accessibilityHint="Begins tracking your ride"
  accessibilityRole="button"
>
  <Text>Start Trip</Text>
</TouchableOpacity>
```

**All interactive elements MUST have:**
- `accessibilityLabel` (spoken by VoiceOver/TalkBack).
- `accessibilityHint` (additional context).
- `accessibilityRole` (button, link, header, etc.).

---

### 6.2 Dynamic Text (iOS / Android)

**Support user-defined text size:**
```jsx
import { Text, Platform } from 'react-native';

<Text
  style={{
    fontSize: 16,
    ...Platform.select({
      ios: { fontWeight: '600', letterSpacing: 0 },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  }}
  allowFontScaling={true}  // Respect system text size
  maxFontSizeMultiplier={1.5}  // Cap at 150% (prevent overflow)
>
  Body Text
</Text>
```

---

### 6.3 Color Contrast (WCAG AA)

**Minimum Ratios:**
- **Text:** 4.5:1 (normal text), 3:1 (large text >18px).
- **UI Elements:** 3:1 (buttons, icons).

**Testing Tool:** Use Figma plugin "Contrast" or online tool (WebAIM Contrast Checker).

**Example (Pass):**
- Text: `#212121` on `#FFFFFF` → 16.1:1 ✅
- Primary button: `#FFFFFF` on `#2196F3` → 4.6:1 ✅

**Example (Fail):**
- Light gray text: `#BDBDBD` on `#FFFFFF` → 2.4:1 ❌ (fix: use `#757575` → 4.6:1 ✅)

---

### 6.4 Touch Targets

**Minimum size:** 44×44 dp (iOS HIG), 48×48 dp (Material Design).

**Implementation:**
```jsx
<TouchableOpacity
  style={{
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <Icon name="close" size={20} color="#757575" />
</TouchableOpacity>
```

**Spacing:** Minimum 8dp between touch targets (prevent mis-taps).

---

### 6.5 Focus Indicators

**Keyboard navigation (Android TV, web):**
```jsx
<TouchableOpacity
  style={({ pressed, focused }) => [
    styles.button,
    focused && { borderWidth: 2, borderColor: '#2196F3' },  // Focus ring
  ]}
>
  <Text>Button</Text>
</TouchableOpacity>
```

---

## 7. Dark Mode Design

### 7.1 Principles
1. **True black (`#121212`)** for OLED power savings.
2. **Reduce contrast:** Don't use pure white text; use `#E0E0E0` (softer on eyes).
3. **Elevation via borders:** Instead of heavy shadows, use subtle `1px` borders with `rgba(255,255,255,0.1)`.
4. **Preserve brand colors:** Primary (`#2196F3`) works in both modes; adjust secondary if needed.

### 7.2 Token Overrides (Dark Mode)

```json
{
  "darkModeOverrides": {
    "background": "#121212",
    "surface": "#1E1E1E",
    "cardBackground": "#2C2C2C",
    "textPrimary": "#E0E0E0",
    "textSecondary": "#A0A0A0",
    "border": "#3A3A3A",
    "shadowColor": "transparent",  // No shadows in dark mode
    "elevationBorder": "rgba(255,255,255,0.1)"
  }
}
```

### 7.3 Map Styles
- **Light mode:** Mapbox "streets-v11".
- **Dark mode:** Mapbox "dark-v10" (custom style with brand colors).

---

## 8. Responsive Design (Small Screens)

### 8.1 Compact Mode (Scooters)

**Purpose:** Optimize for scooter riders (simpler UI, fewer stats).

**Changes:**
- Hide "Max Speed" stat (scooters rarely exceed 60 km/h).
- Larger font sizes (easier to glance while riding).
- Fewer cards on dashboard (reduce scrolling).

**Toggle:** Settings > Appearance > Compact Mode.

---

### 8.2 Breakpoints

- **Small (≤375px width):** iPhone SE, older Android.  
  - Stack cards vertically (no horizontal scroll).
  - Reduce padding (16px → 12px).
- **Medium (375-414px):** iPhone 13, Pixel 6.  
  - Default layout.
- **Large (≥414px):** iPhone 14 Pro Max, tablets.  
  - Show 2 cards per row (grid layout).

---

## 9. Microinteractions Summary

| Interaction | Trigger | Duration | Easing | Purpose |
|-------------|---------|----------|--------|---------|
| **Pairing Pulse** | BLE scan start | 1200ms (loop) | ease-in-out | Indicate scanning |
| **Milestone Confetti** | Reach 1k/5k/10k km | 900ms | cubic-bezier | Celebrate achievement |
| **Trip Start Zoom** | Trip starts | 600ms | ease-out | Confirm tracking active |
| **Card Flip** | Tap maintenance card | 400ms | cubic-bezier | Reveal details |
| **Pull-to-Refresh** | Pull down gesture | Until done | spring | Sync data |
| **FAB Expand** | Tap FAB | 300ms (stagger) | ease-out-back | Show quick actions |
| **Badge Pulse** | New notification | 800ms | ease-in-out | Draw attention |
| **Skeleton Load** | Data loading | Until done | shimmer | Reduce perceived wait |

---

## 10. High-Fidelity Mockup Descriptions

### 10.1 Dashboard (Light Mode)

**Layout:**
- **Top Bar (64dp height):**
  - Left: Hamburger menu icon (24dp, `#212121`).
  - Center: "RideCare" logo (custom font, 20px, `#2196F3`).
  - Right: Profile avatar (32dp circle, gradient background).

- **Hero Card (120dp height):**
  - Background: Linear gradient `#2196F3` → `#1976D2`.
  - Text: "Hero Splendor Plus BS6" (14px, white, 600 weight).
  - Odometer: "12,450 km" (34px, white, 700 weight).
  - Label: "Current Odometer" (14px, `rgba(255,255,255,0.8)`).

- **Quick Stats (3 cards, horizontal scroll, 100dp each):**
  - Card 1: "Today" | "45 km" | Circular progress ring (70% filled).
  - Card 2: "This Week" | "203 km" | "+12%" badge (green).
  - Card 3: "Next Service" | "In 450 km" | Orange progress bar.

- **Maintenance Alerts (expandable list):**
  - Alert 1: Orange card, "⚠️ Oil change due in 100 km" | Swipe actions (Complete, Snooze).
  - Alert 2: Green card, "✅ Chain lubed 2 days ago".

- **Trip History (scrollable list, 5 visible):**
  - Item: Icon (map marker), "Morning Commute" | "18 km • 42 min" | Chevron right.

- **FAB (56dp diameter):** Blue circle, white "+" icon, shadow-xl.

---

### 10.2 Dashboard (Dark Mode)

**Changes from Light Mode:**
- Background: `#121212` (true black).
- Cards: `#2C2C2C` with `1px` border `rgba(255,255,255,0.1)`.
- Text: `#E0E0E0` (primary), `#A0A0A0` (secondary).
- Hero card: Keep gradient (looks great on OLED).
- Shadows: Removed (use borders instead).

---

## 11. Developer Handoff Checklist

- [x] Design tokens exported as JSON (colors, typography, spacing).
- [x] Component library documented (buttons, cards, inputs, modals).
- [x] Wireframes provided (ASCII + descriptions).
- [x] Animation specs with code examples (React Native Animated API).
- [x] Accessibility guidelines (screen reader, contrast, touch targets).
- [x] Dark mode overrides.
- [x] Responsive breakpoints.
- [x] High-fi mockup descriptions.

**Assets Needed:**
- [ ] App logo (SVG + PNG, 512×512).
- [ ] App icon (iOS: 1024×1024, Android: 512×512, adaptive).
- [ ] Splash screen (2048×2048).
- [ ] Illustration assets (onboarding hero images).

---

**End of UX/UI Design System**

**Next:** Technical architecture, API spec (OpenAPI), database schema.
