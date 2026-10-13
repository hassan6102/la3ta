import {Check} from 'lucide-react'
import {localize} from '@/lib/localize'
import type {ServiceCategory} from '@/lib/types'
import {CategoryIcon} from './category-icon'

type Props = {category: ServiceCategory; locale: string; showItems?: boolean}

export function CategoryCard({category, locale, showItems = true}: Props) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <CategoryIcon id={category.id} className="size-7" />
      </div>
      <h3 className="text-2xl">{localize(category.name, locale)}</h3>
      <p className="mt-2 text-ink-soft">{localize(category.description, locale)}</p>
      {showItems && (
        <ul className="mt-6 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {category.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 py-1">
              <Check aria-hidden className="mt-1.5 size-4 shrink-0 text-brand" />
              <span>{localize(item.name, locale)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
