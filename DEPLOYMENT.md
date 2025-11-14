# 🚀 Deployment Guide

## Step 1: Deploy to GitHub Pages

### 1. Create GitHub Repository
```bash
cd /Users/kjartan.kristjansson/Projects/AI/cursor
git init
git add .
git commit -m "Initial commit - Bouvet Values Arcade"
```

### 2. Create repo on GitHub.com
- Go to https://github.com/new
- Repository name: `bouvet-arcade` (or any name you want)
- Make it public
- Don't initialize with README (you already have files)
- Click "Create repository"

### 3. Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/bouvet-arcade.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
- Go to your repo Settings → Pages
- Source: "GitHub Actions"
- The site will automatically deploy!

### 5. Update vite.config.js
Open `vite.config.js` and change:
```javascript
base: '/cursor/',  // Change to '/bouvet-arcade/' or whatever your repo name is
```

### 6. Access Your Game
After deployment (takes 1-2 minutes):
- Your game will be at: `https://YOUR_USERNAME.github.io/bouvet-arcade/`

---

## Step 2: Add Firebase for Real Multiplayer (Optional)

### Why Firebase?
- Current multiplayer only works on same device
- Firebase Realtime Database enables true cross-device multiplayer
- Free tier: 1GB storage, 10GB/month bandwidth (plenty for your game!)

### Setup Firebase

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "Bouvet Arcade"
   - Disable Google Analytics (optional)

2. **Add Web App**
   - In project overview, click Web icon (</>)
   - Register app name: "Bouvet Arcade Web"
   - Copy the config object

3. **Enable Realtime Database**
   - Go to Build → Realtime Database
   - Click "Create Database"
   - Choose location closest to your users
   - Start in **test mode** (we'll add security rules)

4. **Install Firebase**
   ```bash
   npm install firebase
   ```

5. **Add Firebase Config**
   Create `src/firebase.js`:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getDatabase } from 'firebase/database';

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const database = getDatabase(app);
   ```

6. **Update Security Rules**
   In Firebase Console → Realtime Database → Rules:
   ```json
   {
     "rules": {
       "rooms": {
         "$roomId": {
           ".read": true,
           ".write": true,
           ".indexOn": ["lastActivity"]
         }
       }
     }
   }
   ```

Let me know if you want me to:
- ✅ Help you deploy to GitHub Pages (I can guide you step by step)
- ✅ Add Firebase integration for real multiplayer
- ✅ Both!

---

## Quick Deploy (No Firebase)

If you just want to deploy now without multiplayer:

```bash
# Build the project
npm run build

# The dist/ folder contains your game
# You can deploy this to any static host:
# - GitHub Pages
# - Netlify
# - Vercel
# - Firebase Hosting
```

---

## Current Features
- ✅ Single Player mode works everywhere
- ✅ 5 unique mini-games
- ✅ Local leaderboard
- ⚠️ Multiplayer works on same device only (localStorage)
- 🔄 Add Firebase for cross-device multiplayer

## After Firebase Setup
- ✅ True cross-device multiplayer
- ✅ Share room links with friends anywhere
- ✅ Real-time score updates across the internet
- ✅ Persistent rooms and players

