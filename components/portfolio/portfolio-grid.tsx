import {localize} from '@/lib/localize'
import type {PortfolioItem} from '@/lib/types'

/** Renders portfolio items from data. Empty until the admin adds real work. */
export function PortfolioGrid({items, locale}: {items: PortfolioItem[]; locale: string}) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={localize(item.title, locale)} loading="lazy" className="aspect-video w-full object-cover" />
          <p className="p-4 font-bold">{localize(item.title, locale)}</p>
        </li>
      ))}
    </ul>
  )
}
