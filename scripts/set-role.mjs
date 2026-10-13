/**
 * Grants or removes an admin role (custom claim) for an EXISTING Firebase Auth user.
 *
 *   npm run admin:set-role -- owner@example.com super_admin
 *   npm run admin:set-role -- someone@example.com none        (removes the role)
 *   npm run admin:set-role -- --check                         (only tests the credentials)
 *
 * Reads credentials from .env.local (see .env.example). This is how the very first
 * super_admin is created; after that, super_admins manage roles from Admin > Users.
 */
import {applicationDefault, cert, initializeApp} from 'firebase-admin/app'
import {getAuth} from 'firebase-admin/auth'
import {readServiceAccount} from '../lib/firebase/service-account.mjs'

const ROLES = ['super_admin', 'admin', 'editor', 'none']
const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const [email, role] = args.filter((a) => !a.startsWith('--'))

if (!checkOnly && (!email || !ROLES.includes(role))) {
  console.error(`Usage: npm run admin:set-role -- <email> <${ROLES.join('|')}>\n       npm run admin:set-role -- --check`)
  process.exit(1)
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
if (!projectId) {
  console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in .env.local (it should be sira-20fae).')
  process.exit(1)
}

const loaded = readServiceAccount(process.env)
if (!loaded.ok) {
  console.error(`Credential problem: ${loaded.problem}`)
  process.exit(1)
}
for (const warning of loaded.warnings) console.warn(`WARNING: ${warning}`)

// Safe summary (never prints the key itself).
console.log(`Credentials: source=${loaded.source}${loaded.credential ? `, service account=${loaded.credential.clientEmail}` : ''}, project=${projectId}`)

const app = initializeApp({
  credential: loaded.credential ? cert({projectId: loaded.credential.projectId ?? projectId, clientEmail: loaded.credential.clientEmail, privateKey: loaded.credential.privateKey}) : applicationDefault(),
  projectId,
})

/** Explains the most common reasons Google refuses to issue an access token. */
async function explainTokenFailure(error) {
  const message = String(error?.message ?? error)
  console.error(`\nGoogle refused to issue an access token.\nFull error: ${message}\n`)

  // Probe the token endpoint: tells us if the network works and whether this computer's clock is correct.
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {method: 'POST'})
    const serverDate = response.headers.get('date')
    if (serverDate) {
      const skewMinutes = Math.round((Date.now() - Date.parse(serverDate)) / 60000)
      if (Math.abs(skewMinutes) >= 3) {
        console.error(`CLOCK PROBLEM: this computer's clock is off by about ${skewMinutes} minutes. Google rejects keys when the clock is wrong. Turn on automatic date/time in Windows/macOS settings, then run again.`)
        return
      }
    }
    console.error('Network to Google works and the clock looks correct, so the key itself is the problem.')
  } catch {
    console.error('NETWORK PROBLEM: cannot reach oauth2.googleapis.com. Check your internet, VPN, proxy or firewall, then run again.')
    return
  }

  if (/invalid[_ ]grant|signature|invalid jwt/i.test(message)) {
    console.error(
      [
        'Most likely cause: this key was deleted, revoked, or does not match the service-account email.',
        'Fix: Firebase Console > Project settings > Service accounts > Generate new private key,',
        'then copy BOTH client_email and private_key from the SAME new JSON file into .env.local,',
        'and delete the old key in Google Cloud Console > IAM & Admin > Service Accounts > Keys if you want.',
      ].join('\n'),
    )
  } else if (/not found|disabled|deleted/i.test(message)) {
    console.error('The service account may be disabled or deleted. Generate a new key from Firebase Console > Project settings > Service accounts.')
  }
}

try {
  await app.options.credential.getAccessToken()
} catch (error) {
  await explainTokenFailure(error)
  process.exit(1)
}
console.log('Credentials OK: Google issued an access token.')
if (checkOnly) process.exit(0)

const auth = getAuth(app)
try {
  const user = await auth.getUserByEmail(email)
  const claims = {...(user.customClaims ?? {})}
  if (role === 'none') delete claims.role
  else claims.role = role
  await auth.setCustomUserClaims(user.uid, claims)
  await auth.revokeRefreshTokens(user.uid) // forces a fresh sign-in so the new role takes effect
  console.log(`OK: ${email} (${user.uid}) role = ${role}. They must sign in again.`)
} catch (error) {
  console.error(
    error?.code === 'auth/user-not-found'
      ? `No Firebase Auth user with email ${email}. Create it first in the Firebase Console > Authentication > Users.`
      : error,
  )
  process.exit(1)
}
