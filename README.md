# HabitQuest

HabitQuest is a gamified habit tracker that turns your daily routines into an RPG-style adventure. Sign in with Google, create habits, track daily completions, and earn XP, levels, badges, and streaks to stay motivated.

## Features

- **Three habit types** — Single (daily checkbox), Counter (incremental targets like "8 glasses of water"), and Multi-slot (named slots like Morning/Evening)
- **Gamification** — Earn XP for each completion, level up through 6 tiers (Seedling to Ancient Oak), unlock badges for streak and XP milestones
- **Streaks** — Track consecutive days of habit completion with a fire streak counter
- **Calendar heatmap** — View your completion history across the past 60 days with color-coded intensity
- **Google sign-in** — All data synced to the cloud via Firebase, accessible from any device
- **Dark theme** — Purple/indigo accented UI with ambient animations

## Tech Stack

- React 18 + Vite 5 (JavaScript, no TypeScript)
- React Router v6 for client-side routing
- Firebase Authentication (Google OAuth) + Firestore (NoSQL database)
- date-fns for date manipulation
- lucide-react for icons
- All inline styles with CSS variables for theming

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A Firebase project (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Add a Web App and copy the `firebaseConfig` values
3. Copy `.env.example` to `.env` and fill in your Firebase config values
4. Enable **Google** sign-in under Authentication > Sign-in method
5. Create a **Firestore Database** in production mode
6. Set Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for auto-deploys.

In Vercel project settings, add these environment variables:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then update `src/lib/firebase.js` to use `import.meta.env.VITE_*` variables.

## Project Structure

```
src/
  lib/
    firebase.js       # Firebase config and initialization
    AuthContext.jsx    # Auth provider and useAuth() hook
    db.js             # Firestore read/write helpers
  hooks/
    useHabits.js      # Central state management for habits, completions, and profile
  components/
    UI.jsx            # Reusable UI primitives (Button, Modal, Input, etc.)
    HabitCard.jsx     # Habit display card (supports single, counter, multi types)
    HabitModal.jsx    # Create/edit habit form
    CalendarView.jsx  # Monthly calendar heatmap
    LevelPanel.jsx    # XP progress, level info, and badge collection
  pages/
    Login.jsx         # Google sign-in page
    Dashboard.jsx     # Main app with Today, History, and Level tabs
  styles/
    globals.css       # CSS variables, animations, and global styles
```
