// src/config/firebase.ts
import { getApp, getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
}

// Ensure we don’t re-initialize in fast refresh
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Use initializeAuth on native to get proper persistence
const auth =
  getApps().length === 1
    ? initializeAuth(app, {
        persistence: browserLocalPersistence
      })
    : getAuth(app)

const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
