'use client'

import {useTranslations} from 'next-intl'
import {useEffect} from 'react'
import {useRouter} from '@/i18n/navigation'
import type {ActionState} from '@/lib/admin/types'
import {useNotify} from './toast'

/** Shows a toast for each action result; on success either navigates to `redirectTo` or refreshes the page. */
export function useFormResult(state: ActionState, redirectTo?: string) {
  const notify = useNotify()
  const router = useRouter()
  useEffect(() => {
    if (!state) return
    notify(state)
    if (state.ok) {
      if (redirectTo) router.replace(redirectTo)
      else router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
}

/** Returns a function that gives the translated error message for a field, if the server flagged it. */
export function useFieldError(state: ActionState) {
  const t = useTranslations('admin.errors')
  return (name: string): string | undefined => {
    const code = state?.fieldErrors?.[name]
    return code ? t(code === 'required' ? 'required' : 'invalid') : undefined
  }
}
