'use client'

import {useTranslations} from 'next-intl'
import {useActionState} from 'react'
import {setUserRoleAction} from '@/app/[locale]/admin/(shell)/users/actions'
import {ROLES} from '@/lib/auth/roles'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, inputClass} from './ui'

export function RoleForm() {
  const t = useTranslations('admin.users')
  const c = useTranslations('admin.common')
  const [state, action] = useActionState(setUserRoleAction, null)
  const err = useFieldError(state)
  useFormResult(state)

  return (
    <form action={action}>
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg">{t('grantTitle')}</h2>
          <p className="text-ink-soft">{t('grantText')}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('email')} htmlFor="email" error={err('email')}>
            <input id="email" name="email" type="email" dir="ltr" required className={inputClass} />
          </Field>
          <Field label={c('role')} htmlFor="role" error={err('role')}>
            <select id="role" name="role" defaultValue="editor" className={inputClass}>
              {[...ROLES, 'none'].map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <SubmitButton>{t('apply')}</SubmitButton>
      </Card>
    </form>
  )
}
