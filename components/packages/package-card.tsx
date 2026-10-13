import {Check} from 'lucide-react'
import {getLocale, getTranslations} from 'next-intl/server'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {localize} from '@/lib/localize'
import {formatMoney} from '@/lib/money'
import type {StudioPackage} from '@/lib/types'
import {cn} from '@/lib/utils'

/** Renders one package from data. Used as soon as packages exist in Firestore (Phase 2). */
export async function PackageCard({pkg}: {pkg: StudioPackage}) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('packages')])
  const name = localize(pkg.name, locale)
  const finalPrice = pkg.discountedPrice ?? pkg.price

  return (
    <article className={cn('flex flex-col rounded-2xl border bg-surface p-6 sm:p-8', pkg.featured ? 'border-brand' : 'border-line')}>
      {pkg.badge && (
        <span className="mb-4 inline-block self-start rounded-full bg-brand px-3 py-1 text-sm font-bold text-brand-ink">
          {localize(pkg.badge, locale)}
        </span>
      )}
      <h3 className="text-2xl">{name}</h3>
      <p className="mt-2 text-ink-soft">{localize(pkg.description, locale)}</p>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-3">
        <span className="text-3xl font-extrabold text-brand">{formatMoney(finalPrice, locale)}</span>
        {pkg.discountedPrice && <span className="text-ink-soft line-through">{formatMoney(pkg.price, locale)}</span>}
      </p>
      <ul className="mt-6 flex-1 space-y-1">
        {pkg.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check aria-hidden className="mt-1.5 size-4 shrink-0 text-brand" />
            <span>{localize(feature, locale)}</span>
          </li>
        ))}
      </ul>
      <WhatsAppButton className="mt-6" label={t('choose')} message={t('orderMessage', {name})} />
    </article>
  )
}
