import {NextResponse, type NextRequest} from 'next/server'
import {SESSION_COOKIE, SESSION_MAX_AGE_MS} from '@/lib/auth/constants'
import {createAdminSessionCookie} from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

/** Rejects cross-site requests: when an Origin header is present it must match this host. */
function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === request.nextUrl.host
  } catch {
    return false
  }
}

/** Sign in: exchange a fresh Firebase ID token for an HTTP-only session cookie (admins only). */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({code: 'forbidden'}, {status: 403})

  const body: unknown = await request.json().catch(() => null)
  const idToken = typeof body === 'object' && body !== null ? (body as {idToken?: unknown}).idToken : undefined
  if (typeof idToken !== 'string' || idToken.length < 20 || idToken.length > 6000) {
    return NextResponse.json({code: 'invalid_token'}, {status: 400})
  }

  const result = await createAdminSessionCookie(idToken)
  if (!result.ok) {
    const status = result.code === 'not_configured' ? 503 : result.code === 'not_admin' ? 403 : 401
    return NextResponse.json({code: result.code}, {status})
  }

  const response = NextResponse.json({ok: true})
  response.cookies.set(SESSION_COOKIE, result.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS / 1000,
  })
  return response
}

/** Sign out. */
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({code: 'forbidden'}, {status: 403})
  const response = NextResponse.json({ok: true})
  response.cookies.set(SESSION_COOKIE, '', {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0})
  return response
}
