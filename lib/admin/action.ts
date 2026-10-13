import 'server-only'
import {revalidatePath} from 'next/cache'
import type {ZodType, output} from 'zod'
import {AuthError, requirePermission} from '@/lib/auth/requireRole'
import type {Permission} from '@/lib/auth/roles'
import type {AdminSession} from '@/lib/auth/session'
import {isAdminConfigured} from '@/lib/firebase/admin'
import type {ActionState, ResultCode} from './types'

export type {ActionState, ResultCode} from './types'

export const done = (code: ResultCode = 'saved', id?: string): ActionState => ({ok: true, code, id})
export const failed = (code: ResultCode, fieldErrors?: Record<string, string>): ActionState => ({ok: false, code, fieldErrors})

export class InvalidInput extends Error {
  constructor(public readonly fieldErrors: Record<string, string>) {
    super('invalid input')
  }
}

/** Validates untrusted input. Field errors carry a code ("required" | "invalid") the UI translates. */
export function parseInput<S extends ZodType>(schema: S, data: unknown): output<S> {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join('.') || '_'
    if (!(key in fieldErrors)) fieldErrors[key] = issue.code === 'too_small' || issue.message === 'required' ? 'required' : 'invalid'
  }
  throw new InvalidInput(fieldErrors)
}

/**
 * Wraps every admin server action: configured? signed in? allowed? then runs `fn`.
 * Authorization happens here on the server; hidden buttons are only a convenience.
 */
export async function guarded(permission: Permission, fn: (session: AdminSession) => Promise<ActionState>): Promise<ActionState> {
  if (!isAdminConfigured()) return failed('not_configured')
  try {
    const session = await requirePermission(permission)
    return await fn(session)
  } catch (error) {
    if (error instanceof AuthError) return failed(error.code)
    if (error instanceof InvalidInput) return failed('invalid', error.fieldErrors)
    console.error('[admin action]', error)
    return failed('error')
  }
}

/** Public pages are statically rendered; this refreshes them after an admin change. */
export function revalidatePublicSite(): void {
  revalidatePath('/[locale]', 'layout')
}
