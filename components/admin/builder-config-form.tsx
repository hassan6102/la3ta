'use client'

import {useTranslations} from 'next-intl'
import {useActionState} from 'react'
import {saveBuilderConfigAction} from '@/app/[locale]/admin/(shell)/pricing/actions'
import type {BuilderConfigInput} from '@/lib/models/pricing'
import {piastersToInputValue} from '@/lib/money'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, inputClass} from './ui'

export function BuilderConfigForm({config}: {config: BuilderConfigInput}) {
  const t = useTranslations('admin.pricing')
  const [state, action] = useActionState(saveBuilderConfigAction, null)
  const err = useFieldError(state)
  useFormResult(state)

  return (
    <form action={action}>
      <Card className="space-y-5">
        <h2 className="text-lg">{t('configTitle')}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('minTotal')} htmlFor="minTotal" hint={t('minTotalHint')} error={err('minTotal')}>
            <input id="minTotal" name="minTotal" inputMode="decimal" dir="ltr" defaultValue={piastersToInputValue(config.minTotal)} className={inputClass} />
          </Field>
          <Field label={t('roundTo')} htmlFor="roundTo" hint={t('roundToHint')} error={err('roundTo')}>
            <input id="roundTo" name="roundTo" inputMode="decimal" dir="ltr" defaultValue={piastersToInputValue(config.roundTo)} className={inputClass} />
          </Field>
          <Field label={t('notesAr')} htmlFor="notesAr" error={err('notes.ar')}>
            <textarea id="notesAr" name="notesAr" rows={3} defaultValue={config.notes.ar} className={inputClass} />
          </Field>
          <Field label={t('notesEn')} htmlFor="notesEn" error={err('notes.en')}>
            <textarea id="notesEn" name="notesEn" rows={3} dir="ltr" defaultValue={config.notes.en} className={inputClass} />
          </Field>
        </div>
        <SubmitButton />
      </Card>
    </form>
  )
}
