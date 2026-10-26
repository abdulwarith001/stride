# STRIDE // Circuit Run Tracker

**STRIDE** is a fast, minimalist, and 100% offline out-and-back circuit running tracker built with React 19, TypeScript, Vite, and Tailwind CSS.

Designed for runners who run strict point-to-point circuits (`Home ⇄ Turnaround Checkpoint ⇄ Home`), STRIDE enforces physical geofence verification at each leg of the run using real-time satellite GPS hardware.

---

## Key Features

- **100% Offline & Private**: Zero external mapping servers, analytics, or third-party API dependencies. Runs entirely in your browser using `navigator.geolocation` and `localStorage`.
- **Strict Geofence Enforcement**:
  - **Start**: You must be physically inside your Home geofence (±20m–50m) to start the timer.
  - **Turnaround Check-In**: You can only check in at the turnaround point when you physically enter the turnaround geofence radius.
  - **Finish**: The run only completes when you return to your Home geofence.
- **Athletic UI**: Minimalist digital stopwatch, dynamic distance countdown, and animated circuit route visualizer.
- **GPS Radar Calibration Modal**:
  - Live animated sweep radar scanner displaying GPS coordinates and lock status.
  - 2-way tab switcher to calibrate **Home (Origin)** and **Turnaround (Destination)** seamlessly.
  - Adjustable detection radii: **±20m**, **±30m**, or **±50m**.
- **Interactive Route Pill**: Tap either endpoint directly on the ready screen to re-calibrate or inspect geofence settings.
- **Custom Native-Free Dialogs**: Replaces all browser alerts with styled custom confirmation modals for canceling runs, clearing history, and proximity warnings.
- **Session Splits & Run History**:
  - Auto-records exact start time, turnaround check-in, finish time, outbound split, return split, and total distance.
  - History drawer persists all runs in `localStorage` with options to delete individual records or clear all.
- **Progressive Web App (PWA)**: Installable as a native-like standalone app on both iOS (Safari) and Android (Chrome) without browser address bars.

---

## Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Persistence**: Browser `localStorage` (100% offline)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/tracker.git
cd tracker

# Install dependencies
npm install
# or
pnpm install
```

### Running Locally

```bash
# Start Vite development server (broadcasts over local network for mobile testing)
npm run dev
```

Vite will output:
- **Local**: `http://localhost:5173/`
- **Network**: `http://<your-local-ip>:5173/`

### Production Build

```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Installing as a Mobile Web App (PWA)

To run STRIDE outdoors with full satellite GPS:

### iPhone (iOS Safari)
1. Ensure your Mac and iPhone are connected to the same Wi-Fi network (or deploy to Vercel/Netlify/Cloudflare Pages).
2. Open the network URL in **Safari**.
3. Tap the **Share** button (box with an upward arrow at the bottom).
4. Scroll down and tap **Add to Home Screen**.
5. Tap **Add**. Launch STRIDE from your home screen in full-screen standalone mode.

### Android (Chrome)
1. Open the URL in **Google Chrome**.
2. Tap the **three-dot menu (`⋮`)** in the upper-right corner.
3. Tap **Install app** or **Add to Home screen**.
4. Confirm installation. Launch STRIDE directly from your app drawer.

---

## Project Structure

```
tracker/
├── public/
│   ├── icon.svg             # High-resolution STRIDE flame emblem app icon
│   └── manifest.json        # PWA Web App Manifest (standalone mode)
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx       # Custom athletic alert & confirmation modal
│   │   ├── HistoryDrawer.tsx      # Slide-up history sheet with splits & timestamps
│   │   ├── LocationSetupModal.tsx # GPS radar scanner with Home/Turnaround tabs
│   │   └── RunCircuitView.tsx     # Circuit lifecycle: ready, outbound, inbound
│   ├── utils/
│   │   └── geo.ts           # Haversine distance, timers, haptics, and localStorage
│   ├── App.tsx              # Application root, GPS watch loop, and circuit state machine
│   ├── index.css            # Custom animations (radar sweep, ping, shimmer, dash flow)
│   ├── main.tsx             # React entry point
│   └── types.ts             # TypeScript definitions for locations, records, and phases
├── index.html               # Mobile meta tags, Apple touch icon, and manifest links
├── package.json
├── tailwind.config.js
└── vite.config.ts           # Host network broadcast configuration
```

---

## License

MIT
