import createMiddleware from 'next-intl/middleware'
import {NextResponse, type NextRequest} from 'next/server'
import {SESSION_COOKIE} from './lib/auth/constants'
import {routing} from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

/**
 * Locale routing for every page, plus a cheap first gate for /admin: no session cookie means
 * redirect to the login page. This only checks that a cookie EXISTS. The real verification
 * (signature, expiry, revocation, role) happens on the server in every admin layout, page and action.
 */
export default function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(ar|en)\/admin(?:\/(.*))?$/)
  if (match && match[2] !== 'login' && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL(`/${match[1]}/admin/login`, request.url))
  }
  return intlMiddleware(request)
}

export const config = {matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']}
