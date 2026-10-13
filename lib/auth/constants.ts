/** Safe to import from the proxy/middleware and from client code (no server imports). */
export const SESSION_COOKIE = 'sira_session'
/** Firebase allows 5 minutes to 14 days. */
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000
/** An ID token must be this fresh to be exchanged for a session cookie. */
export const MAX_AUTH_AGE_SECONDS = 5 * 60
