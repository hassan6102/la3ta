'use server'

import {z} from 'zod'
import {done, failed, guarded, parseInput, type ActionState} from '@/lib/admin/action'
import {str} from '@/lib/admin/form'
import {adminAuth} from '@/lib/firebase/admin'
import {audit} from '@/lib/repositories/base'

const schema = z.object({email: z.string().trim().toLowerCase().email().max(200), role: z.enum(['super_admin', 'admin', 'editor', 'none'])})

/**
 * Grants or removes a role by setting a Firebase custom claim with the Admin SDK.
 * Only super_admin can call this, and the browser cannot touch claims at all.
 * The target's refresh tokens are revoked so the change applies on their next sign-in.
 */
export async function setUserRoleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('users:manage', async (session) => {
    const {email, role} = parseInput(schema, {email: str(formData, 'email'), role: str(formData, 'role')})
    const auth = adminAuth()

    let user
    try {
      user = await auth.getUserByEmail(email)
    } catch (error) {
      if (typeof error === 'object' && error !== null && (error as {code?: string}).code === 'auth/user-not-found') return failed('user_not_found')
      throw error
    }
    if (user.uid === session.uid) return failed('cannot_change_self')

    const claims = {...(user.customClaims ?? {})}
    if (role === 'none') delete claims.role
    else claims.role = role
    await auth.setCustomUserClaims(user.uid, claims)
    await auth.revokeRefreshTokens(user.uid)
    await audit(session, `role:${role}`, 'authUsers', user.uid)
    return done('role_updated')
  })
}
