# 🔥 Firebase Multiplayer Setup Guide

Follow these steps to enable **true cross-device multiplayer** for your Bouvet Values Arcade!

---

## Step 1: Create Firebase Project

1. Go to **https://console.firebase.google.com/**
2. Click **"Add project"** or **"Create a project"**
3. Project name: `Bouvet Arcade` (or any name)
4. Click **Continue**
5. **Disable Google Analytics** (optional, not needed for this project)
6. Click **Create project**
7. Wait for project to be created, then click **Continue**

---

## Step 2: Add Web App to Firebase

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. App nickname: `Bouvet Arcade Web`
3. **Do NOT** check "Also set up Firebase Hosting"
4. Click **Register app**
5. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "bouvet-arcade.firebaseapp.com",
  projectId: "bouvet-arcade",
  storageBucket: "bouvet-arcade.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. **Copy this entire config object** (you'll need it in Step 4)
7. Click **Continue to console**

---

## Step 3: Enable Realtime Database

1. In the left sidebar, click **Build** → **Realtime Database**
2. Click **Create Database**
3. Select your database location (choose closest to your users):
   - US: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
4. Click **Next**
5. **Start in test mode** (for development)
6. Click **Enable**
7. **Copy the database URL** from the top of the page
   - It looks like: `https://bouvet-arcade-default-rtdb.firebaseio.com/`
   - **Important:** Add this as `databaseURL` in your config!

---

## Step 4: Update Your Code with Firebase Config

1. Open `src/firebase-config.js` in your code editor
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // From Step 2
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",         // From Step 3 - IMPORTANT!
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. **Save the file**

---

## Step 5: Set Firebase Security Rules

1. In Firebase Console, go to **Realtime Database**
2. Click the **Rules** tab
3. Replace the rules with this:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["lastActivity"],
        ".validate": "newData.hasChildren(['code', 'host', 'players', 'lastActivity'])"
      }
    }
  }
}
```

4. Click **Publish**

> ⚠️ **Note:** These rules allow anyone to read/write. For production, you should add authentication!

---

## Step 6: Deploy to GitHub Pages

1. **Commit your changes:**
```bash
cd /Users/kjartan.kristjansson/Projects/AI/cursor
git add .
git commit -m "Add Firebase multiplayer support"
git push origin main
```

2. Wait for GitHub Actions to deploy (1-2 minutes)

3. Visit: **https://kjarisk.github.io/bouvetvalues/**

---

## Step 7: Test Multiplayer!

1. Open your game: `https://kjarisk.github.io/bouvetvalues/`
2. Click **Multiplayer**
3. **Create a room**
4. Copy the room link or code
5. Open the link on **another device** (phone, tablet, different computer)
6. Join the same room
7. **You should see each other in the player list!** 👥
8. Start a game and watch scores update in real-time! 🔥

---

## ✅ What Works After Setup:

- ✅ Create rooms from any device
- ✅ Share room links via SMS, email, Slack, etc.
- ✅ Join rooms from different devices/networks
- ✅ Real-time player list updates
- ✅ Live score updates during gameplay
- ✅ Automatic room cleanup (1 hour expiry)

---

## 🚨 Troubleshooting

### "Room not found" error
- Make sure Firebase Realtime Database is enabled
- Check that `databaseURL` is in your config
- Verify Firebase rules are published

### Scores not updating
- Check browser console for errors
- Verify your Firebase config is correct
- Make sure you're connected to the internet

### Players not showing up
- Check that Firebase rules allow read/write
- Verify both users are in the same room code
- Try refreshing both browsers

---

## 🔐 Security (For Production)

For a production app, you should:

1. **Enable Firebase Authentication**
2. **Update security rules** to require authentication:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

3. **Add rate limiting** to prevent abuse
4. **Add room cleanup** Cloud Function for expired rooms

---

## 💰 Firebase Free Tier Limits

Firebase Realtime Database free tier includes:
- **1 GB stored data**
- **10 GB/month downloaded**
- **100 simultaneous connections**

This is **more than enough** for your team's arcade! 🎮

---

## Need Help?

If you run into issues:
1. Check the browser console for errors (F12)
2. Verify your Firebase config in `src/firebase-config.js`
3. Make sure Realtime Database is enabled in Firebase Console
4. Check that your security rules are published

**Have fun gaming!** 🎉

