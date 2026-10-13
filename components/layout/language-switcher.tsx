'use client'

import {Languages} from 'lucide-react'
import {useLocale} from 'next-intl'
import {Link, usePathname} from '@/i18n/navigation'

/** Always visible, one tap. Keeps the user on the same page when switching. */
export function LanguageSwitcher({label}: {label: string}) {
  const locale = useLocale()
  const pathname = usePathname()
  const target = locale === 'ar' ? 'en' : 'ar'
  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      hrefLang={target}
      aria-label={label}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand"
    >
      <Languages aria-hidden className="size-5" />
      {target === 'ar' ? 'العربية' : 'English'}
    </Link>
  )
}
