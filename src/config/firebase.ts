import AsyncStorage from '@react-native-async-storage/async-storage'
import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  // @ts-expect-error - getReactNativePersistence is not in the public typings yet
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { Platform } from 'react-native'

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

let auth: Auth
try {
  auth = initializeAuth(app, {
    persistence:
      Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage)
  })
} catch {
  auth = getAuth(app)
}

const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
