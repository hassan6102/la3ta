import 'server-only'
import {cookies} from 'next/headers'
import {cache} from 'react'
import {adminAuth, isAdminConfigured} from '@/lib/firebase/admin'
import {MAX_AUTH_AGE_SECONDS, SESSION_COOKIE, SESSION_MAX_AGE_MS} from './constants'
import {isRole, type Role} from './roles'

export type AdminSession = {uid: string; email: string | null; role: Role}

/** The signed-in admin for this request, or null. Verifies signature, expiry and revocation. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isAdminConfigured()) return null
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  if (!value) return null
  try {
    const decoded = await adminAuth().verifySessionCookie(value, true)
    const role: unknown = decoded.role
    if (!isRole(role)) return null
    return {uid: decoded.uid, email: decoded.email ?? null, role}
  } catch {
    return null
  }
})

export type CreateSessionResult =
  | {ok: true; cookie: string}
  | {ok: false; code: 'invalid_token' | 'not_admin' | 'recent_login_required' | 'not_configured'}

/** Exchanges a fresh Firebase ID token for an HTTP-only session cookie, only for users with a role claim. */
export async function createAdminSessionCookie(idToken: string): Promise<CreateSessionResult> {
  if (!isAdminConfigured()) return {ok: false, code: 'not_configured'}
  const auth = adminAuth()
  let decoded
  try {
    decoded = await auth.verifyIdToken(idToken, true)
  } catch {
    return {ok: false, code: 'invalid_token'}
  }
  const role: unknown = decoded.role
  if (!isRole(role)) return {ok: false, code: 'not_admin'}
  if (Date.now() / 1000 - decoded.auth_time > MAX_AUTH_AGE_SECONDS) return {ok: false, code: 'recent_login_required'}
  const cookie = await auth.createSessionCookie(idToken, {expiresIn: SESSION_MAX_AGE_MS})
  return {ok: true, cookie}
}
