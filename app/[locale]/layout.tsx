import type {Metadata, Viewport} from 'next'
import {Cairo} from 'next/font/google'
import {notFound} from 'next/navigation'
import {Analytics} from '@vercel/analytics/next'
import {hasLocale, NextIntlClientProvider} from 'next-intl'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {getDirection, routing} from '@/i18n/routing'
import {getSiteSettings} from '@/lib/data'
import {localize} from '@/lib/localize'
import '../globals.css'

// One font that covers Arabic + Latin, so both languages look consistent.
const cairo = Cairo({subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap'})

type Props = {children: React.ReactNode; params: Promise<{locale: string}>}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export async function generateMetadata({params}: Pick<Props, 'params'>): Promise<Metadata> {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [t, settings] = await Promise.all([getTranslations({locale, namespace: 'meta'}), getSiteSettings()])
  const name = localize(settings.studioName, locale)
  return {
    title: {default: `${name} | ${t('title')}`, template: `%s | ${name}`},
    description: t('description'),
    alternates: {languages: {ar: '/ar', en: '/en'}},
    icons: {icon: '/icon.svg'},
  }
}

export const viewport: Viewport = {colorScheme: 'dark', themeColor: '#121212'}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    // lang + dir are rendered on the server: no flash of the wrong direction.
    <html lang={locale} dir={getDirection(locale)}>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
