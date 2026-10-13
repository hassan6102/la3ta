import {getApp, getApps, initializeApp, type FirebaseApp} from 'firebase/app'
import {getAuth, type Auth} from 'firebase/auth'
import {firebaseConfig, isFirebaseConfigured} from './config'

/**
 * Lazily creates the single Firebase web app (project: sira-20fae).
 * The browser only uses it for sign-in. Business data is read and written on the server.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Copy .env.example to .env.local and fill in NEXT_PUBLIC_FIREBASE_* values.')
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}
