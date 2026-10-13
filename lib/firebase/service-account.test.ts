import {generateKeyPairSync} from 'node:crypto'
import {describe, expect, it} from 'vitest'
import {normalizePrivateKey, readServiceAccount} from './service-account.mjs'

const pem = generateKeyPairSync('rsa', {modulusLength: 2048}).privateKey.export({type: 'pkcs8', format: 'pem'}).toString()
const EMAIL = 'firebase-adminsdk-abc12@sira-20fae.iam.gserviceaccount.com'
const base = {NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'sira-20fae', FIREBASE_ADMIN_CLIENT_EMAIL: EMAIL}

const shapes: Record<string, string> = {
  'real newlines': pem,
  'escaped \\n (JSON style)': pem.trim().replace(/\n/g, '\\n'),
  'wrapped in double quotes': `"${pem.trim().replace(/\n/g, '\\n')}"`,
  'wrapped in single quotes': `'${pem.trim().replace(/\n/g, '\\n')}'`,
  'with trailing comma (copied from JSON)': `"${pem.trim().replace(/\n/g, '\\n')}",`,
  'CRLF line endings': pem.replace(/\n/g, '\r\n'),
  'one line separated by spaces': pem.trim().replace(/\n/g, ' '),
  'double-escaped \\\\n': pem.trim().replace(/\n/g, '\\\\n'),
}

describe('service account credentials', () => {
  for (const [name, value] of Object.entries(shapes)) {
    it(`accepts a key with ${name}`, () => {
      expect(normalizePrivateKey(value)).toBe(pem)
      const result = readServiceAccount({...base, FIREBASE_ADMIN_PRIVATE_KEY: value})
      expect(result.ok).toBe(true)
    })
  }

  it('accepts the whole JSON file, plain or base64', () => {
    const json = JSON.stringify({client_email: EMAIL, private_key: pem, project_id: 'sira-20fae'})
    for (const value of [json, Buffer.from(json).toString('base64')]) {
      expect(readServiceAccount({NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'sira-20fae', FIREBASE_SERVICE_ACCOUNT_JSON: value}).ok).toBe(true)
    }
  })

  it('rejects a truncated key with a clear problem', () => {
    const cut = pem.slice(0, 120)
    const result = readServiceAccount({...base, FIREBASE_ADMIN_PRIVATE_KEY: cut})
    expect(result.ok).toBe(false)
  })

  it('rejects a wrong email and warns on a project mismatch', () => {
    expect(readServiceAccount({...base, FIREBASE_ADMIN_CLIENT_EMAIL: 'me@gmail.com', FIREBASE_ADMIN_PRIVATE_KEY: pem}).ok).toBe(false)
    const mismatch = readServiceAccount({...base, NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'other-project', FIREBASE_ADMIN_PRIVATE_KEY: pem})
    expect(mismatch.ok && mismatch.warnings.length).toBe(1)
  })
})
