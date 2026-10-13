'use client'

import {signInWithEmailAndPassword, signOut} from 'firebase/auth'
import {useTranslations} from 'next-intl'
import {useState} from 'react'
import {useRouter} from '@/i18n/navigation'
import {isFirebaseConfigured} from '@/lib/firebase/config'
import {getFirebaseAuth} from '@/lib/firebase/client'
import {Field, inputClass, primaryButton} from './ui'

const CREDENTIAL_ERRORS = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email']

export function LoginForm() {
  const t = useTranslations('admin.login')
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    setError(null)

    if (!isFirebaseConfigured()) {
      setError('firebase_missing')
      return
    }

    setPending(true)
    try {
      const auth = getFirebaseAuth()
      const credential = await signInWithEmailAndPassword(auth, email, password)
      // Force a refresh so the token carries the latest custom claims (role).
      const idToken = await credential.user.getIdToken(true)
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({idToken}),
      })
      // The browser does not keep a Firebase session: the server cookie is the only credential.
      await signOut(auth)
      if (response.ok) {
        router.replace('/admin')
        return
      }
      const body: {code?: string} = await response.json().catch(() => ({}))
      setError(body.code === 'not_admin' || body.code === 'not_configured' || body.code === 'recent_login_required' ? body.code : 'generic')
    } catch (e) {
      const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as {code: unknown}).code) : ''
      setError(CREDENTIAL_ERRORS.includes(code) ? 'invalid_credentials' : code === 'auth/too-many-requests' ? 'too_many' : 'generic')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label={t('email')} htmlFor="email">
        <input id="email" name="email" type="email" dir="ltr" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label={t('password')} htmlFor="password">
        <input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required className={inputClass} />
      </Field>
      {error && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300">
          {t(`errors.${error}`)}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
        {pending ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
