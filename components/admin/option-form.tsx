'use client'

import {Plus, Trash2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useActionState, useState} from 'react'
import {saveOptionAction} from '@/app/[locale]/admin/(shell)/pricing/actions'
import {Link} from '@/i18n/navigation'
import type {OptionDoc} from '@/lib/models/pricing'
import {piastersToInputValue} from '@/lib/money'
import {useFieldError, useFormResult} from './form-hooks'
import {SubmitButton} from './submit-button'
import {Card, Field, iconButtonClass, inputClass, outlineButton} from './ui'

type EffectType = 'flat' | 'per_unit' | 'percent'
type Row = {id: string; labelAr: string; labelEn: string; effectType: EffectType; amount: string; percent: string; targets: string[]}

const newId = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
const blankRow = (id: string): Row => ({id, labelAr: '', labelEn: '', effectType: 'flat', amount: '', percent: '', targets: []})

function fromDoc(option: OptionDoc | null): Row[] {
  if (!option) return [blankRow(newId())]
  return option.choices.map((c) => ({
    id: c.id,
    labelAr: c.label.ar,
    labelEn: c.label.en,
    effectType: c.effect.type,
    amount: c.effect.type === 'percent' ? '' : piastersToInputValue(c.effect.amount),
    percent: c.effect.type === 'percent' ? String(c.effect.percent) : '',
    targets: c.effect.type === 'flat' ? [] : c.effect.targetServiceIds,
  }))
}

type Props = {option: OptionDoc | null; services: {id: string; label: string}[]}

export function OptionForm({option, services}: Props) {
  const t = useTranslations('admin.pricing')
  const c = useTranslations('admin.common')
  const [state, action] = useActionState(saveOptionAction, null)
  const err = useFieldError(state)
  useFormResult(state, '/admin/pricing')

  const [type, setType] = useState<'select' | 'toggle'>(option?.type ?? 'select')
  const [rows, setRows] = useState<Row[]>(() => fromDoc(option))

  // A toggle has exactly one choice with the fixed id "on".
  const effectiveRows = type === 'toggle' ? [{...(rows[0] ?? blankRow('on')), id: 'on'}] : rows
  const patch = (index: number, change: Partial<Row>) => setRows((all) => all.map((r, i) => (i === index ? {...r, ...change} : r)))
  const toggleTarget = (index: number, serviceId: string) =>
    setRows((all) => all.map((r, i) => (i === index ? {...r, targets: r.targets.includes(serviceId) ? r.targets.filter((s) => s !== serviceId) : [...r.targets, serviceId]} : r)))

  return (
    <form action={action} className="space-y-6">
      {option && <input type="hidden" name="id" value={option.id} />}
      <input type="hidden" name="choices" value={JSON.stringify(effectiveRows)} />

      <Card className="grid gap-5 sm:grid-cols-2">
        <Field label={c('nameAr')} htmlFor="nameAr" error={err('name.ar')}>
          <input id="nameAr" name="nameAr" defaultValue={option?.name.ar} className={inputClass} required />
        </Field>
        <Field label={c('nameEn')} htmlFor="nameEn" error={err('name.en')}>
          <input id="nameEn" name="nameEn" defaultValue={option?.name.en} dir="ltr" className={inputClass} />
        </Field>
        <Field label={t('type')} htmlFor="type">
          <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as 'select' | 'toggle')} className={inputClass}>
            <option value="select">{t('select')}</option>
            <option value="toggle">{t('toggle')}</option>
          </select>
        </Field>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input type="checkbox" name="active" defaultChecked={option?.active ?? true} className="size-5 accent-[var(--color-brand)]" />
            {c('active')}
          </label>
          <label className="flex min-h-11 items-center gap-3 font-bold">
            <input type="checkbox" name="required" defaultChecked={option?.required ?? false} className="size-5 accent-[var(--color-brand)]" />
            {t('required')}
          </label>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg">{type === 'toggle' ? t('onLabel') : t('choices')}</h2>
        {err('choices') && <p role="alert" className="text-sm font-semibold text-red-400">{err('choices')}</p>}
        {effectiveRows.map((row, index) => (
          <Card key={row.id} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('choiceAr')} htmlFor={`la-${row.id}`} error={err(`choices.${index}.label.ar`)}>
                <input id={`la-${row.id}`} value={row.labelAr} onChange={(e) => patch(index, {labelAr: e.target.value})} className={inputClass} />
              </Field>
              <Field label={t('choiceEn')} htmlFor={`le-${row.id}`}>
                <input id={`le-${row.id}`} dir="ltr" value={row.labelEn} onChange={(e) => patch(index, {labelEn: e.target.value})} className={inputClass} />
              </Field>
              <Field label={t('effect')} htmlFor={`ef-${row.id}`}>
                <select id={`ef-${row.id}`} value={row.effectType} onChange={(e) => patch(index, {effectType: e.target.value as EffectType})} className={inputClass}>
                  {(['flat', 'per_unit', 'percent'] as const).map((k) => (
                    <option key={k} value={k}>
                      {t(`effects.${k}`)}
                    </option>
                  ))}
                </select>
              </Field>
              {row.effectType === 'percent' ? (
                <Field label={t('percentLabel')} htmlFor={`pc-${row.id}`} error={err(`choices.${index}.effect.percent`)}>
                  <input id={`pc-${row.id}`} inputMode="decimal" dir="ltr" value={row.percent} onChange={(e) => patch(index, {percent: e.target.value})} className={inputClass} />
                </Field>
              ) : (
                <Field label={t('amount')} htmlFor={`am-${row.id}`} error={err(`choices.${index}.effect`) ?? err(`choices.${index}.effect.amount`)}>
                  <input id={`am-${row.id}`} inputMode="decimal" dir="ltr" value={row.amount} onChange={(e) => patch(index, {amount: e.target.value})} className={inputClass} />
                </Field>
              )}
            </div>
            {row.effectType !== 'flat' && (
              <fieldset>
                <legend className="mb-1 text-sm font-bold">{t('targets')}</legend>
                <p className="mb-2 text-sm text-ink-soft">{t('targetsHint')}</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {services.map((s) => (
                    <label key={s.id} className="flex min-h-9 items-center gap-2">
                      <input type="checkbox" checked={row.targets.includes(s.id)} onChange={() => toggleTarget(index, s.id)} className="size-4 accent-[var(--color-brand)]" />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {type === 'select' && rows.length > 1 && (
              <button type="button" aria-label={c('remove')} title={c('remove')} className={iconButtonClass} onClick={() => setRows((all) => all.filter((_, i) => i !== index))}>
                <Trash2 aria-hidden className="size-4" />
              </button>
            )}
          </Card>
        ))}
        {type === 'select' && (
          <button type="button" onClick={() => setRows((all) => [...all, blankRow(newId())])} className={outlineButton}>
            <Plus aria-hidden className="size-5" />
            {t('addChoice')}
          </button>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <SubmitButton />
        <Link href="/admin/pricing" className={outlineButton}>
          {c('cancel')}
        </Link>
      </div>
    </form>
  )
}
