'use client'

import {useTranslations} from 'next-intl'
import {useActionState} from 'react'
import {saveCategoryAction} from '@/app/[locale]/admin/(shell)/service-categories/actions'
import {Link} from '@/i18n/navigation'
import type {CategoryDoc} from '@/lib/models/catalog'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, inputClass, outlineButton} from './ui'

export function CategoryForm({category}: {category: CategoryDoc | null}) {
  const c = useTranslations('admin.common')
  const [state, action] = useActionState(saveCategoryAction, null)
  const err = useFieldError(state)
  useFormResult(state, '/admin/service-categories')

  return (
    <form action={action} className="space-y-6">
      {category && <input type="hidden" name="id" value={category.id} />}
      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={c('nameAr')} htmlFor="nameAr" error={err('name.ar')}>
          <input id="nameAr" name="nameAr" defaultValue={category?.name.ar} className={inputClass} required />
        </Field>
        <Field label={c('nameEn')} htmlFor="nameEn" error={err('name.en')}>
          <input id="nameEn" name="nameEn" defaultValue={category?.name.en} dir="ltr" className={inputClass} />
        </Field>
        <Field label={c('descriptionAr')} htmlFor="descriptionAr" error={err('description.ar')}>
          <textarea id="descriptionAr" name="descriptionAr" rows={3} defaultValue={category?.description.ar} className={inputClass} />
        </Field>
        <Field label={c('descriptionEn')} htmlFor="descriptionEn" error={err('description.en')}>
          <textarea id="descriptionEn" name="descriptionEn" rows={3} defaultValue={category?.description.en} dir="ltr" className={inputClass} />
        </Field>
        <label className="flex min-h-11 items-center gap-3 font-bold sm:col-span-2">
          <input type="checkbox" name="active" defaultChecked={category?.active ?? true} className="size-5 accent-[var(--color-brand)]" />
          {c('active')}
        </label>
      </Card>
      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link href="/admin/service-categories" className={outlineButton}>
          {c('cancel')}
        </Link>
      </div>
    </form>
  )
}
