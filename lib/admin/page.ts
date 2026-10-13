import 'server-only'
import {setRequestLocale} from 'next-intl/server'
import {requirePageSession} from '@/lib/auth/requireRole'
import {can, type Permission} from '@/lib/auth/roles'
import type {AdminSession} from '@/lib/auth/session'

/**
 * First line of every admin page: sets the locale, requires a valid session, and reports whether
 * the role may see this page. (The layout also checks the session; pages never rely on that alone.)
 */
export async function adminPage(locale: string, permission?: Permission): Promise<{session: AdminSession; allowed: boolean}> {
  setRequestLocale(locale)
  const session = await requirePageSession(locale)
  return {session, allowed: permission ? can(session.role, permission) : true}
}
