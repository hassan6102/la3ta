'use client'

import {Plus, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useActionState, useState} from 'react'
import {savePackageAction} from '@/app/[locale]/admin/(shell)/packages/actions'
import {Link} from '@/i18n/navigation'
import type {PackageDoc} from '@/lib/models/packages'
import {piastersToInputValue} from '@/lib/money'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, iconButtonClass, inputClass, outlineButton} from './ui'

type Props = {pkg: PackageDoc | null; services: {id: string; label: string}[]; canPrice: boolean}
type Row = {key: number; serviceId: string; quantity: string}

export function PackageForm({pkg, services, canPrice}: Props) {
  const t = useTranslations('admin.packages')
  const c = useTranslations('admin.common')
  const [state, action] = useActionState(savePackageAction, null)
  const err = useFieldError(state)
  useFormResult(state, '/admin/packages')

  const [rows, setRows] = useState<Row[]>(() => (pkg?.includes ?? []).map((i, key) => ({key, serviceId: i.serviceId, quantity: String(i.quantity)})))
  const update = (key: number, patch: Partial<Row>) => setRows((all) => all.map((r) => (r.key === key ? {...r, ...patch} : r)))
  const addRow = () => setRows((all) => [...all, {key: Date.now(), serviceId: '', quantity: '1'}])
  const includesJson = JSON.stringify(rows.filter((r) => r.serviceId).map((r) => ({serviceId: r.serviceId, quantity: Number(r.quantity)})))

  return (
    <form action={action} className="space-y-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}
      <input type="hidden" name="includes" value={includesJson} />

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={c('nameAr')} htmlFor="nameAr" error={err('name.ar')}>
          <input id="nameAr" name="nameAr" defaultValue={pkg?.name.ar} className={inputClass} required />
        </Field>
        <Field label={c('nameEn')} htmlFor="nameEn" error={err('name.en')}>
          <input id="nameEn" name="nameEn" defaultValue={pkg?.name.en} dir="ltr" className={inputClass} />
        </Field>
        <Field label={c('descriptionAr')} htmlFor="descriptionAr" error={err('description.ar')}>
          <textarea id="descriptionAr" name="descriptionAr" rows={3} defaultValue={pkg?.description.ar} className={inputClass} />
        </Field>
        <Field label={c('descriptionEn')} htmlFor="descriptionEn" error={err('description.en')}>
          <textarea id="descriptionEn" name="descriptionEn" rows={3} defaultValue={pkg?.description.en} dir="ltr" className={inputClass} />
        </Field>
        <Field label={t('badgeAr')} htmlFor="badgeAr" error={err('badge.ar')}>
          <input id="badgeAr" name="badgeAr" defaultValue={pkg?.badge.ar} className={inputClass} />
        </Field>
        <Field label={t('badgeEn')} htmlFor="badgeEn" error={err('badge.en')}>
          <input id="badgeEn" name="badgeEn" defaultValue={pkg?.badge.en} dir="ltr" className={inputClass} />
        </Field>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg">{t('includesTitle')}</h2>
        {err('includes') && <p role="alert" className="text-sm font-semibold text-red-400">{err('includes')}</p>}
        {rows.map((row) => (
          <div key={row.key} className="flex flex-wrap items-end gap-3">
            <div className="min-w-48 flex-1">
              <label className="mb-1.5 block text-sm font-bold" htmlFor={`svc-${row.key}`}>
                {t('selectService')}
              </label>
              <select id={`svc-${row.key}`} value={row.serviceId} onChange={(e) => update(row.key, {serviceId: e.target.value})} className={inputClass}>
                <option value="">{t('selectService')}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1.5 block text-sm font-bold" htmlFor={`qty-${row.key}`}>
                {t('quantity')}
              </label>
              <input id={`qty-${row.key}`} type="number" min={1} dir="ltr" value={row.quantity} onChange={(e) => update(row.key, {quantity: e.target.value})} className={inputClass} />
            </div>
            <button type="button" aria-label={c('remove')} title={c('remove')} className={iconButtonClass} onClick={() => setRows((all) => all.filter((r) => r.key !== row.key))}>
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addRow} className={outlineButton}>
          <Plus aria-hidden className="size-5" />
          {t('addService')}
        </button>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg">{t('featuresTitle')}</h2>
        <p className="text-sm text-ink-soft">{t('featuresHint')}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('featuresAr')} htmlFor="featuresAr">
            <textarea id="featuresAr" name="featuresAr" rows={5} defaultValue={pkg?.features.map((f) => f.ar).join('\n')} className={inputClass} />
          </Field>
          <Field label={t('featuresEn')} htmlFor="featuresEn">
            <textarea id="featuresEn" name="featuresEn" rows={5} dir="ltr" defaultValue={pkg?.features.map((f) => f.en).join('\n')} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-5">
        {!canPrice && <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{t('editorNote')}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('price')} htmlFor="price" hint={t('priceHint')} error={err('price')}>
            <input id="price" name="price" inputMode="decimal" dir="ltr" defaultValue={piastersToInputValue(pkg?.price)} disabled={!canPrice} required={canPrice} className={inputClass} />
          </Field>
          <Field label={t('originalPrice')} htmlFor="originalPrice" hint={t('originalPriceHint')} error={err('originalPrice')}>
            <input id="originalPrice" name="originalPrice" inputMode="decimal" dir="ltr" defaultValue={piastersToInputValue(pkg?.originalPrice)} disabled={!canPrice} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <Field label={t('imageUrl')} htmlFor="imageUrl" hint={t('imageHint')} error={err('imageUrl')}>
          <input id="imageUrl" name="imageUrl" type="url" dir="ltr" placeholder="https://" defaultValue={pkg?.imageUrl} className={inputClass} />
        </Field>
        <div className="flex flex-wrap gap-6">
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input type="checkbox" name="active" defaultChecked={pkg?.active ?? true} className="size-5 accent-[var(--color-brand)]" />
            {c('active')}
          </label>
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input type="checkbox" name="featured" defaultChecked={pkg?.featured ?? false} className="size-5 accent-[var(--color-brand)]" />
            {t('featured')}
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link href="/admin/packages" className={outlineButton}>
          {c('cancel')}
        </Link>
      </div>
    </form>
  )
}
