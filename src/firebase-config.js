// Firebase configuration
// You'll need to replace these values with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Replace with your Firebase config
// You'll get this from Firebase Console -> Project Settings -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBwrb31u6xO6Rt_LipzZBDd0ZyZPTvPRfQ",
  authDomain: "bouvetvalues.firebaseapp.com",
  databaseURL: "https://bouvetvalues-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bouvetvalues",
  storageBucket: "bouvetvalues.firebasestorage.app",
  messagingSenderId: "394362333112",
  appId: "1:394362333112:web:67c054fd84cbf3a0ff114d"
};

// Initialize Firebase
let app;
let database;
let firebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  firebaseInitialized = true;
  console.log("✅ Firebase initialized successfully!");
  console.log("🔥 Using Firebase Realtime Database for multiplayer");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  console.warn("⚠️ Multiplayer will use fallback localStorage mode (local only)");
}

export { database };
export const isFirebaseConfigured = () => {
  const configured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseInitialized && database !== undefined;
  console.log(`🔍 Firebase configured: ${configured}`);
  return configured;
};

