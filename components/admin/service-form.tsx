'use client'

import {useTranslations} from 'next-intl'
import {useActionState} from 'react'
import {saveServiceAction} from '@/app/[locale]/admin/(shell)/services/actions'
import {Link} from '@/i18n/navigation'
import type {ServiceDoc} from '@/lib/models/catalog'
import {PRICING_UNITS} from '@/lib/models/common'
import {piastersToInputValue} from '@/lib/money'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, inputClass, outlineButton} from './ui'

type Props = {service: ServiceDoc | null; categories: {id: string; label: string}[]; canPrice: boolean}

export function ServiceForm({service, categories, canPrice}: Props) {
  const t = useTranslations('admin.services')
  const c = useTranslations('admin.common')
  const [state, action] = useActionState(saveServiceAction, null)
  const err = useFieldError(state)
  useFormResult(state, '/admin/services')

  const b = service?.builder
  return (
    <form action={action} className="space-y-6">
      {service && <input type="hidden" name="id" value={service.id} />}

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={t('category')} htmlFor="categoryId" error={err('categoryId')} className="sm:col-span-2">
          <select id="categoryId" name="categoryId" defaultValue={service?.categoryId ?? categories[0]?.id} className={inputClass} required>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c('nameAr')} htmlFor="nameAr" error={err('name.ar')}>
          <input id="nameAr" name="nameAr" defaultValue={service?.name.ar} className={inputClass} required />
        </Field>
        <Field label={c('nameEn')} htmlFor="nameEn" error={err('name.en')}>
          <input id="nameEn" name="nameEn" defaultValue={service?.name.en} dir="ltr" className={inputClass} />
        </Field>
        <Field label={c('descriptionAr')} htmlFor="descriptionAr" error={err('description.ar')}>
          <textarea id="descriptionAr" name="descriptionAr" rows={3} defaultValue={service?.description.ar} className={inputClass} />
        </Field>
        <Field label={c('descriptionEn')} htmlFor="descriptionEn" error={err('description.en')}>
          <textarea id="descriptionEn" name="descriptionEn" rows={3} defaultValue={service?.description.en} dir="ltr" className={inputClass} />
        </Field>
        <label className="flex min-h-11 items-center gap-3 font-bold sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="size-5 accent-[var(--color-brand)]" />
          {c('active')}
        </label>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg">{t('pricingTitle')}</h2>
        {!canPrice && <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{t('editorNote')}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('unit')} htmlFor="unit" error={err('pricing.unit')}>
            <select id="unit" name="unit" defaultValue={service?.pricing.unit ?? 'per_item'} disabled={!canPrice} className={inputClass}>
              {PRICING_UNITS.map((u) => (
                <option key={u} value={u}>
                  {t(`units.${u}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('unitPrice')} htmlFor="unitPrice" hint={t('unitPriceHint')} error={err('pricing.unitPrice')}>
            <input
              id="unitPrice"
              name="unitPrice"
              inputMode="decimal"
              dir="ltr"
              defaultValue={piastersToInputValue(service?.pricing.unitPrice)}
              disabled={!canPrice}
              className={inputClass}
            />
          </Field>
          <label className="flex min-h-11 items-center gap-3 font-bold sm:col-span-2">
            <input type="checkbox" name="showPrice" defaultChecked={service?.pricing.showPrice ?? false} disabled={!canPrice} className="size-5 accent-[var(--color-brand)]" />
            {t('showPrice')}
          </label>
        </div>
      </Card>

      <Card className="space-y-5">
        <h2 className="text-lg">{t('builderTitle')}</h2>
        <label className="flex min-h-11 items-center gap-3 font-bold">
          <input type="checkbox" name="builderEnabled" defaultChecked={b?.enabled ?? false} disabled={!canPrice} className="size-5 accent-[var(--color-brand)]" />
          {t('builderEnabled')}
        </label>
        <div className="grid gap-5 sm:grid-cols-4">
          {(
            [
              ['minQty', b?.minQty ?? 1],
              ['maxQty', b?.maxQty ?? 100],
              ['step', b?.step ?? 1],
              ['defaultQty', b?.defaultQty ?? 1],
            ] as const
          ).map(([name, value]) => (
            <Field key={name} label={t(name)} htmlFor={name} error={err(`builder.${name}`)}>
              <input id={name} name={name} type="number" min={1} dir="ltr" defaultValue={value} disabled={!canPrice} className={inputClass} />
            </Field>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link href="/admin/services" className={outlineButton}>
          {c('cancel')}
        </Link>
      </div>
    </form>
  )
}
