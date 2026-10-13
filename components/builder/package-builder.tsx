'use client'

import {Check, Minus, Plus, RotateCcw} from 'lucide-react'
import {useLocale, useTranslations} from 'next-intl'
import {useMemo, useState} from 'react'
import {formatMoney} from '@/lib/money'
import {calculateQuote} from '@/lib/pricing/engine'
import type {PricingConfig, PricingOptionDef, Quote, Selection} from '@/lib/pricing/types'
import {buildWhatsAppUrl} from '@/lib/whatsapp'
import {cn} from '@/lib/utils'

type Props = {
  config: PricingConfig
  categories: {id: string; name: {ar: string; en: string}}[]
  notes: {ar: string; en: string}
  whatsappNumber: string
}

const pickText = (text: {ar: string; en: string}, locale: string) => (locale === 'en' ? text.en || text.ar : text.ar || text.en)

/**
 * Live builder. All prices come from `config` (Firestore, managed in the admin dashboard).
 * The total shown while editing is an ESTIMATE from the shared pricing engine; "Confirm price"
 * asks the server to recalculate from the current configuration, and only that result is sent on WhatsApp.
 */
export function PackageBuilder({config, categories, notes, whatsappNumber}: Props) {
  const t = useTranslations('builder.live')
  const units = useTranslations('admin.services.units')
  const locale = useLocale()

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.options.filter((o) => o.required && o.choices[0]).map((o) => [o.id, o.choices[0].id])),
  )
  const [verified, setVerified] = useState<{key: string; quote: Quote; changed: boolean} | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState(false)

  const selection: Selection = useMemo(
    () => ({
      items: Object.entries(quantities).filter(([, q]) => q > 0).map(([serviceId, quantity]) => ({serviceId, quantity})),
      options: Object.entries(choices).filter(([, c]) => c).map(([optionId, choiceId]) => ({optionId, choiceId})),
    }),
    [quantities, choices],
  )
  const selectionKey = JSON.stringify(selection)
  const estimate = useMemo(() => calculateQuote(config, selection), [config, selection])
  const activeVerified = verified && verified.key === selectionKey ? verified : null
  const quote = activeVerified?.quote ?? estimate
  const money = (piasters: number) => formatMoney({amount: piasters / 100, currency: config.currency}, locale)
  const hasItems = selection.items.length > 0

  function step(serviceId: string, direction: 1 | -1) {
    const s = config.services.find((x) => x.id === serviceId)
    if (!s) return
    setVerifyError(false)
    setQuantities((all) => {
      const current = all[serviceId] ?? 0
      const next = direction === 1 ? (current === 0 ? s.minQty : Math.min(s.maxQty, current + s.step)) : current <= s.minQty ? 0 : current - s.step
      return {...all, [serviceId]: next}
    })
  }

  function setChoice(option: PricingOptionDef, choiceId: string) {
    setVerifyError(false)
    setChoices((all) => ({...all, [option.id]: choiceId}))
  }

  async function verify() {
    setVerifying(true)
    setVerifyError(false)
    try {
      const response = await fetch('/api/quote', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(selection)})
      const body: {quote?: Quote} = await response.json()
      if (!response.ok || !body.quote) throw new Error('quote failed')
      setVerified({key: selectionKey, quote: body.quote, changed: body.quote.total !== estimate.total || body.quote.pricingRevision !== config.revision})
    } catch {
      setVerifyError(true)
    } finally {
      setVerifying(false)
    }
  }

  const whatsappMessage = activeVerified
    ? [
        t('message'),
        ...activeVerified.quote.lineItems.map((l) =>
          l.kind === 'service' ? `- ${pickText(l.name, locale)} × ${l.quantity}` : `- ${pickText(l.name, locale)}: ${pickText(l.label, locale)}`,
        ),
        t('messageTotal', {amount: money(activeVerified.quote.total)}),
      ].join('\n')
    : ''

  const groups = categories
    .map((c) => ({category: c, services: config.services.filter((s) => s.categoryId === c.id)}))
    .filter((g) => g.services.length > 0)
  const knownIds = new Set(categories.map((c) => c.id))
  const orphans = config.services.filter((s) => !knownIds.has(s.categoryId))
  if (orphans.length > 0) groups.push({category: {id: '_other', name: {ar: '', en: ''}}, services: orphans})

  const belowMin = estimate.issues.some((i) => i.code === 'below_min_total')
  const noteText = pickText(notes, locale)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-8">
        <section aria-labelledby="builder-services" className="space-y-6">
          <h2 id="builder-services" className="text-2xl">{t('servicesTitle')}</h2>
          {groups.map(({category, services}) => (
            <div key={category.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              {category.name.ar && <h3 className="mb-3 text-lg text-brand">{pickText(category.name, locale)}</h3>}
              <ul className="divide-y divide-line/60">
                {services.map((s) => {
                  const q = quantities[s.id] ?? 0
                  return (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-bold">{pickText(s.name, locale)}</p>
                        <p className="text-sm text-ink-soft">
                          {money(s.unitPrice ?? 0)} · {units(s.unit)}
                          {(s.minQty > 1 || s.step > 1) && ` · ${t('min')} ${s.minQty}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2" role="group" aria-label={`${pickText(s.name, locale)} — ${t('quantity')}`}>
                        <button type="button" onClick={() => step(s.id, -1)} disabled={q === 0} aria-label="−" className="grid size-11 place-items-center rounded-xl border border-line hover:border-brand disabled:opacity-40">
                          <Minus aria-hidden className="size-5" />
                        </button>
                        <output className="min-w-10 text-center text-lg font-extrabold" aria-live="polite">{q}</output>
                        <button type="button" onClick={() => step(s.id, 1)} disabled={q >= s.maxQty} aria-label="+" className="grid size-11 place-items-center rounded-xl border border-line hover:border-brand disabled:opacity-40">
                          <Plus aria-hidden className="size-5" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>

        {config.options.length > 0 && (
          <section aria-labelledby="builder-options" className="space-y-4">
            <h2 id="builder-options" className="text-2xl">{t('optionsTitle')}</h2>
            {config.options.map((option) => (
              <fieldset key={option.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                <legend className="px-2 text-lg font-bold">
                  {pickText(option.name, locale)} {option.required && <span className="text-sm text-brand">· {t('required')}</span>}
                </legend>
                {option.type === 'toggle' ? (
                  <label className="flex min-h-11 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={choices[option.id] === 'on'}
                      onChange={(e) => setChoice(option, e.target.checked ? 'on' : '')}
                      className="size-5 accent-[var(--color-brand)]"
                    />
                    {pickText(option.choices[0].label, locale)}
                  </label>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {!option.required && (
                      <ChoiceChip active={!choices[option.id]} onClick={() => setChoice(option, '')}>{t('none')}</ChoiceChip>
                    )}
                    {option.choices.map((choice) => (
                      <ChoiceChip key={choice.id} active={choices[option.id] === choice.id} onClick={() => setChoice(option, choice.id)}>
                        {pickText(choice.label, locale)}
                      </ChoiceChip>
                    ))}
                  </div>
                )}
              </fieldset>
            ))}
          </section>
        )}

        {noteText && <p className="rounded-2xl border border-line bg-surface p-5 text-ink-soft">{noteText}</p>}
      </div>

      <aside className="h-fit rounded-3xl border border-brand/50 bg-surface p-6 lg:sticky lg:top-24" aria-labelledby="builder-summary">
        <h2 id="builder-summary" className="mb-4 text-2xl">{t('estimateTitle')}</h2>
        {!hasItems ? (
          <p className="text-ink-soft">{t('empty')}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {quote.lineItems.map((l) => (
                <li key={l.kind === 'service' ? l.serviceId : `${l.optionId}:${l.choiceId}`} className="flex justify-between gap-3">
                  <span>
                    {pickText(l.name, locale)}
                    {l.kind === 'service' ? ` × ${l.quantity}` : `: ${pickText(l.label, locale)}`}
                  </span>
                  <span className="shrink-0 font-bold">{money(l.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-line pt-4">
              {quote.discounts.length > 0 && (
                <>
                  <div className="flex justify-between text-ink-soft"><dt>{t('subtotal')}</dt><dd>{money(quote.subtotal)}</dd></div>
                  {quote.discounts.map((d) => (
                    <div key={d.discountId} className="flex justify-between text-brand"><dt>{t('discount')}: {pickText(d.name, locale)}</dt><dd>−{money(d.amount)}</dd></div>
                  ))}
                </>
              )}
              <div className="flex justify-between text-xl font-extrabold"><dt>{t('total')}</dt><dd>{money(quote.total)}</dd></div>
            </dl>
            {belowMin && <p role="alert" className="mt-3 text-sm font-semibold text-amber-300">{t('minTotal', {amount: money(config.minTotal)})}</p>}
            <p className="mt-3 text-sm text-ink-soft">{t('estimateNote')}</p>

            {activeVerified ? (
              <div className="mt-4 space-y-3">
                <p className="flex items-center gap-2 font-bold text-brand"><Check aria-hidden className="size-5" />{t('verified')}</p>
                {activeVerified.changed && <p className="text-sm text-amber-300">{t('changed')}</p>}
                {activeVerified.quote.valid ? (
                  <a href={buildWhatsAppUrl(whatsappNumber, whatsappMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-whatsapp px-6 text-lg font-bold text-brand-ink hover:bg-whatsapp-hover">
                    {t('sendWhatsapp')}
                  </a>
                ) : (
                  <p role="alert" className="text-sm font-semibold text-amber-300">{t('issue')}</p>
                )}
              </div>
            ) : (
              <button type="button" onClick={verify} disabled={verifying || !estimate.valid} className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-brand px-6 text-lg font-bold text-brand-ink hover:bg-brand-hover disabled:opacity-50">
                {verifying ? t('verifying') : t('verify')}
              </button>
            )}
            {verifyError && <p role="alert" className="mt-3 text-sm font-semibold text-red-400">{t('verifyError')}</p>}
            <button
              type="button"
              onClick={() => { setQuantities({}); setVerified(null) }}
              className="mt-4 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand"
            >
              <RotateCcw aria-hidden className="size-4" />
              {t('reset')}
            </button>
          </>
        )}
      </aside>
    </div>
  )
}

function ChoiceChip({active, onClick, children}: {active: boolean; onClick: () => void; children: React.ReactNode}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn('min-h-11 rounded-xl border px-4 font-semibold transition-colors', active ? 'border-brand bg-brand text-brand-ink' : 'border-line hover:border-brand')}
    >
      {children}
    </button>
  )
}
