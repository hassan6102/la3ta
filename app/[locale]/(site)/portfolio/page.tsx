import type {Metadata} from 'next'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {PortfolioGrid} from '@/components/portfolio/portfolio-grid'
import {PageHeader} from '@/components/ui/page-header'
import {Section} from '@/components/ui/section'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {getPortfolioItems} from '@/lib/data'

type Props = {params: Promise<{locale: string}>}

const CATEGORIES = ['photography', 'video', 'editing', 'thumbnails', 'social', 'educational'] as const

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'nav'})
  return {title: t('portfolio')}
}

export default async function PortfolioPage({params}: Props) {
  const {locale} = await params
  setRequestLocale(locale)
  const [t, w, items] = await Promise.all([getTranslations('portfolio'), getTranslations('whatsapp'), getPortfolioItems()])

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Section>
        {items.length > 0 ? (
          <PortfolioGrid items={items} locale={locale} />
        ) : (
          <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl">{t('emptyTitle')}</h2>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('emptyText')}</p>
            <p className="mt-8 mb-3 font-bold text-brand">{t('categoriesTitle')}</p>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.map((key) => (
                <li key={key} className="rounded-full border border-line px-4 py-1.5">
                  {t(`categories.${key}`)}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <WhatsAppButton size="lg" message={w('general')} />
            </div>
          </div>
        )}
      </Section>
    </>
  )
}
