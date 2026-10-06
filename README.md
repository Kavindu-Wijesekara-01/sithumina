# Sithumina Transport System (සිතුමිණ ප්‍රවාහන සේවය)

Comprehensive Sri Lanka Logistics & Transport Management System with real-time lorry tracking, booking, fleet management, and dedicated driver mobile app.

---

## 📁 Repository Structure

```
sithumina system/
├── sithumina/        # Next.js Web Application (Customer portal, live tracking, booking, fleet management)
└── sithumina_app/    # Expo / React Native Mobile Application (Driver tracking, status updates, GPS)
```

---

## 🚚 1. Web Portal (`sithumina/`)
- **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Leaflet & OpenStreetMap, Firebase Firestore / Realtime DB.
- **Key Features**:
  - Live interactive Sri Lanka map showing available & transit lorries.
  - Multi-language support (English & සිංහල).
  - Vehicle booking and lorry registration forms.
  - Fleet and driver management console.
  - Customer reviews and responsive mobile UI.

```bash
cd sithumina
npm install
npm run dev
```

---

## 📱 2. Driver Mobile App (`sithumina_app/`)
- **Tech Stack**: Expo, React Native, TypeScript, Expo Location.
- **Key Features**:
  - Driver authentication & profile setup.
  - Background/foreground GPS location sharing to live fleet database.
  - Availability status toggling (Available, On Trip, Maintenance).

```bash
cd sithumina_app
npm install
npx expo start
```
