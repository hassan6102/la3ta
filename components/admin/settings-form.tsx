'use client'

import {useTranslations} from 'next-intl'
import {useActionState} from 'react'
import {saveSettingsAction} from '@/app/[locale]/admin/(shell)/settings/actions'
import type {SiteSettingsInput} from '@/lib/models/settings'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, inputClass} from './ui'

export function SettingsForm({settings}: {settings: SiteSettingsInput}) {
  const t = useTranslations('admin.settings')
  const c = useTranslations('admin.common')
  const [state, action] = useActionState(saveSettingsAction, null)
  const err = useFieldError(state)
  useFormResult(state)

  return (
    <form action={action} className="space-y-6">
      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={`${t('studioName')} (${c('nameAr')})`} htmlFor="studioNameAr" error={err('studioName.ar')}>
          <input id="studioNameAr" name="studioNameAr" defaultValue={settings.studioName.ar} className={inputClass} required />
        </Field>
        <Field label={`${t('studioName')} (${c('nameEn')})`} htmlFor="studioNameEn" error={err('studioName.en')}>
          <input id="studioNameEn" name="studioNameEn" defaultValue={settings.studioName.en} dir="ltr" className={inputClass} />
        </Field>
        <Field label={`${t('location')} (${c('nameAr')})`} htmlFor="locationAr" error={err('location.ar')}>
          <input id="locationAr" name="locationAr" defaultValue={settings.location.ar} className={inputClass} required />
        </Field>
        <Field label={`${t('location')} (${c('nameEn')})`} htmlFor="locationEn" error={err('location.en')}>
          <input id="locationEn" name="locationEn" defaultValue={settings.location.en} dir="ltr" className={inputClass} />
        </Field>
      </Card>

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={t('whatsapp')} htmlFor="whatsappNumber" hint={t('whatsappHint')} error={err('whatsappNumber')} className="sm:col-span-2">
          <input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber} dir="ltr" inputMode="tel" className={inputClass} />
        </Field>
        <Field label={t('phone')} htmlFor="phone" error={err('phone')}>
          <input id="phone" name="phone" defaultValue={settings.phone} dir="ltr" inputMode="tel" className={inputClass} />
        </Field>
        <Field label={t('email')} htmlFor="email" error={err('email')}>
          <input id="email" name="email" type="email" defaultValue={settings.email} dir="ltr" className={inputClass} />
        </Field>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg">{t('social')}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {(['facebook', 'instagram', 'youtube', 'tiktok'] as const).map((key) => (
            <Field key={key} label={key[0].toUpperCase() + key.slice(1)} htmlFor={key} error={err(`socialLinks.${key}`)}>
              <input id={key} name={key} type="url" defaultValue={settings.socialLinks[key]} dir="ltr" placeholder="https://" className={inputClass} />
            </Field>
          ))}
        </div>
      </Card>

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={t('currency')} htmlFor="defaultCurrency" hint={t('currencyHint')} error={err('defaultCurrency')}>
          <input id="defaultCurrency" name="defaultCurrency" defaultValue={settings.defaultCurrency} dir="ltr" maxLength={3} className={inputClass} />
        </Field>
        <div>
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input type="checkbox" name="builderEnabled" defaultChecked={settings.builderEnabled} className="size-5 accent-[var(--color-brand)]" />
            {t('builderEnabled')}
          </label>
          <p className="mt-1 text-sm text-ink-soft">{t('builderHint')}</p>
        </div>
      </Card>

      <SubmitButton />
    </form>
  )
}
