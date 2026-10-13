import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ar', 'en'],
  // Arabic (Egyptian market) is the primary language.
  defaultLocale: 'ar',
  // Always open in Arabic at "/", users switch to English explicitly.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
