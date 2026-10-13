/** Shared by server actions and client components. No server-only imports here. */
export type ResultCode =
  | 'saved'
  | 'deleted'
  | 'updated'
  | 'seeded'
  | 'forbidden'
  | 'unauthenticated'
  | 'invalid'
  | 'error'
  | 'in_use'
  | 'not_found'
  | 'not_configured'
  | 'role_updated'
  | 'user_not_found'
  | 'cannot_change_self'

export type ActionState = {ok: boolean; code: ResultCode; fieldErrors?: Record<string, string>; id?: string} | null
