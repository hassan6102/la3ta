/**
 * Reads and repairs Firebase service-account credentials from environment variables.
 * Shared by the Next.js server (lib/firebase/admin.ts) and scripts/set-role.mjs so both behave identically.
 * Plain ESM on purpose (no TypeScript, no Next.js imports) so Node can run it directly.
 *
 * Accepted inputs, in order:
 *  1. FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY   (values copied from the downloaded JSON)
 *  2. FIREBASE_SERVICE_ACCOUNT_JSON   (the whole JSON file, as-is or base64-encoded)
 *  3. GOOGLE_APPLICATION_CREDENTIALS  (path to the JSON file; handled by Google's default credentials)
 */
import {createPrivateKey} from 'node:crypto'

/** Removes whitespace, trailing commas and wrapping quotes that sneak in when copying from JSON. */
function stripWrapping(value) {
  let v = String(value ?? '').trim()
  let previous
  do {
    previous = v
    v = v.replace(/,$/, '').trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).trim()
  } while (v !== previous)
  return v
}

/**
 * Turns any reasonable spelling of a PEM private key into a clean PEM:
 * real newlines, literal "\n" text, CRLF, surrounding quotes, a trailing comma, or a key pasted on a single line.
 */
export function normalizePrivateKey(raw) {
  const text = stripWrapping(raw).replace(/\\r\\n|\\n|\\r/g, '\n').replace(/\r\n?/g, '\n')
  const match = text.match(/-----BEGIN ([A-Z ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/)
  if (!match) return text
  // Keep only base64 characters: drops stray backslashes, quotes, spaces and line breaks inside the body.
  const body = match[2].replace(/[^A-Za-z0-9+/=]/g, '')
  const lines = body.match(/.{1,64}/g)?.join('\n') ?? body
  return `-----BEGIN ${match[1]}-----\n${lines}\n-----END ${match[1]}-----\n`
}

const EMAIL_PATTERN = /^[^@\s]+@([a-z0-9-]+)\.iam\.gserviceaccount\.com$/i

function fromJson(text) {
  const trimmed = stripWrapping(text)
  const json = trimmed.startsWith('{') ? trimmed : Buffer.from(trimmed, 'base64').toString('utf8')
  const parsed = JSON.parse(json)
  return {clientEmail: parsed.client_email, privateKey: parsed.private_key, projectId: parsed.project_id}
}

/**
 * @returns {{ok: true, source: 'env' | 'json' | 'application_default', credential: null | {projectId: string | undefined, clientEmail: string, privateKey: string}, emailProject?: string, warnings: string[]}
 *         | {ok: false, problem: string, warnings: string[]}}
 */
export function readServiceAccount(env = process.env) {
  const warnings = []
  const envProject = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? stripWrapping(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) : undefined

  let source
  let parts
  try {
    if (env.FIREBASE_ADMIN_CLIENT_EMAIL || env.FIREBASE_ADMIN_PRIVATE_KEY) {
      source = 'env'
      parts = {clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY}
    } else if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      source = 'json'
      parts = fromJson(env.FIREBASE_SERVICE_ACCOUNT_JSON)
    } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      return {ok: true, source: 'application_default', credential: null, warnings}
    } else {
      return {ok: false, problem: 'No credentials found. Set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.', warnings}
    }
  } catch {
    return {ok: false, problem: 'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON (or base64 of JSON).', warnings}
  }

  const clientEmail = stripWrapping(parts.clientEmail)
  if (!clientEmail) return {ok: false, problem: 'FIREBASE_ADMIN_CLIENT_EMAIL is empty.', warnings}
  const emailMatch = clientEmail.match(EMAIL_PATTERN)
  if (!emailMatch) {
    return {ok: false, problem: `client_email "${clientEmail}" does not look like a service-account email (expected name@PROJECT.iam.gserviceaccount.com).`, warnings}
  }

  if (!parts.privateKey) return {ok: false, problem: 'FIREBASE_ADMIN_PRIVATE_KEY is empty.', warnings}
  const privateKey = normalizePrivateKey(parts.privateKey)
  if (!privateKey.startsWith('-----BEGIN') || !privateKey.includes('-----END')) {
    return {
      ok: false,
      problem:
        'FIREBASE_ADMIN_PRIVATE_KEY is incomplete: it must start with -----BEGIN PRIVATE KEY----- and end with -----END PRIVATE KEY-----. ' +
        'In .env.local keep the whole key on ONE line, inside double quotes, with the \\n sequences exactly as in the JSON file.',
      warnings,
    }
  }
  try {
    createPrivateKey(privateKey)
  } catch {
    return {ok: false, problem: 'The private key is present but cannot be read (it is cut off or corrupted). Generate a new key and copy it again.', warnings}
  }

  const emailProject = emailMatch[1]
  const projectId = envProject ?? (parts.projectId ? stripWrapping(parts.projectId) : undefined)
  if (projectId && emailProject.toLowerCase() !== projectId.toLowerCase()) {
    warnings.push(`The service account belongs to project "${emailProject}" but the app uses project "${projectId}". Use a key generated inside project ${projectId}.`)
  }

  return {ok: true, source, credential: {projectId, clientEmail, privateKey}, emailProject, warnings}
}
