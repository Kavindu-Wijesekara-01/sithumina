# 🚚 Sithumina Driver - Mobile Application

React Native mobile application for **Sithumina Transport** admins and drivers, connected directly to the central Firebase database to broadcast live GPS coordinates to the web tracking map in real time.

---

## 📱 App Highlights & Architecture

- **App Name & Branding**: "sithumina driver" with official Sithumina Transport logo icon and launch splash screen.
- **Color Theme**: Brand Yellow (`#FFC20E`) & Deep Ink (`#26231B`).
- **Database Integration**: Shares the Firestore database (`lorries`, `drivers`) with the web application (`sithumina`).
- **Real-time GPS Tracking**: Uses `expo-location` to capture coordinates, heading, speed, and accuracy, streaming updates to Firestore every few seconds.

---

## 🔐 Authentication & Roles

### 1. Admin Login
- **Login Key**: `sithuminaadmin$`
- **Features**:
  - Open **Admin Console**.
  - **Register New Driver**: Enter driver name, phone number, lorry plate (e.g. `WP LB-4521`), vehicle type, and primary route.
  - **Automatic ID Generation**: The system automatically generates a unique Driver ID (e.g., `ST-DRV-7821`).
  - View all registered drivers with their assigned IDs and plate numbers.

### 2. Driver Login
- **Login Key**: Unique Driver ID (e.g., `ST-DRV-7821`).
- **Features**:
  - Open **Driver Interface**.
  - **Live GPS Broadcasting**: Toggle on/off continuous GPS broadcasting to Firestore.
  - **Coordinate Monitor**: Real-time Latitude, Longitude, Speed (km/h), Heading (°), and Accuracy (±m).
  - **Vehicle Trip Status**: Toggle between `Empty (Available)` and `On Trip (Loaded)`.
  - **Instant Web Sync**: Any position update or status change reflects on the web application's Sri Lanka Live Map immediately.

---

## 🚀 How to Run the Mobile App

1. Open a terminal in `sithumina_app`:
   ```bash
   cd sithumina_app
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Choose your testing target:
   - Press **`a`** to open on an Android emulator or connected device.
   - Press **`i`** to open on iOS simulator (macOS).
   - Press **`w`** to test directly in your Web Browser.
   - Or scan the QR code using the **Expo Go** app on your physical Android or iPhone.

---

## 📁 Folder Structure

```
sithumina_app/
├── assets/
│   ├── icon.png                 # App Icon (Sithumina logo)
│   ├── logo.png                 # Sithumina Transport logo
│   └── splash-icon.png          # Startup splash screen graphic
├── src/
│   ├── config/
│   │   └── firebase.ts          # Secure Firebase SDK initialization
│   ├── services/
│   │   ├── database.ts          # Auth, driver registration & Firestore sync
│   │   └── location.ts          # Real-time GPS location tracking (expo-location)
│   ├── components/
│   │   └── SplashScreen.tsx     # Startup screen with logo and animations
│   └── screens/
│       ├── LoginScreen.tsx      # Login with Admin ID or Driver ID
│       ├── AdminDashboard.tsx   # Driver registration & unique ID generation
│       └── DriverInterface.tsx  # GPS tracking broadcast & trip status toggle
├── App.tsx                      # Root navigation controller & session storage
├── app.json                     # Expo manifest (app name, permissions, icons)
├── .env                         # Firebase credentials (git-ignored)
└── package.json
```
