import 'server-only'
import {applicationDefault, cert, getApp, getApps, initializeApp, type App} from 'firebase-admin/app'
import {getAuth, type Auth} from 'firebase-admin/auth'
import {getFirestore, type Firestore} from 'firebase-admin/firestore'
import {readServiceAccount, type ServiceAccountResult} from './service-account.mjs'

/**
 * Firebase Admin SDK, server only. It bypasses Security Rules, so every caller must authorize first
 * (see lib/auth/requireRole.ts). Credentials come from server-side environment variables and are
 * cleaned up by service-account.mjs (escaped \n, quotes, trailing commas, one-line keys).
 */
let cached: {signature: string; result: ServiceAccountResult} | undefined

function loadCredential(): ServiceAccountResult {
  const signature = [
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ].join('|')
  if (!cached || cached.signature !== signature) cached = {signature, result: readServiceAccount(process.env)}
  return cached.result
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) && loadCredential().ok
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApp()
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const loaded = loadCredential()
  if (!loaded.ok) throw new Error(`Firebase Admin credentials are invalid: ${loaded.problem}`)
  for (const warning of loaded.warnings) console.warn(`[firebase-admin] ${warning}`)
  if (loaded.credential) {
    const {clientEmail, privateKey} = loaded.credential
    return initializeApp({credential: cert({projectId: loaded.credential.projectId ?? projectId, clientEmail, privateKey}), projectId})
  }
  return initializeApp({credential: applicationDefault(), projectId})
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp())
}

let db: Firestore | undefined
export function adminDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp())
    db.settings({ignoreUndefinedProperties: true})
  }
  return db
}
