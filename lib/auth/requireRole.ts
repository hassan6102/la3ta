import 'server-only'
import {redirect} from '@/i18n/navigation'
import {getAdminSession, type AdminSession} from './session'
import {can, type Permission} from './roles'

export class AuthError extends Error {
  constructor(public readonly code: 'unauthenticated' | 'forbidden') {
    super(code)
  }
}

/** For server actions and route handlers: throws AuthError. */
export async function requirePermission(permission: Permission): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) throw new AuthError('unauthenticated')
  if (!can(session.role, permission)) throw new AuthError('forbidden')
  return session
}

/** For pages and layouts: redirects to the login page when there is no valid session. */
export async function requirePageSession(locale: string): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect({href: '/admin/login', locale})
  return session as AdminSession
}
