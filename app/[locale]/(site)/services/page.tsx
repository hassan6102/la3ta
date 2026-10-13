import type {Metadata} from 'next'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCard} from '@/components/services/category-card'
import {CtaBand} from '@/components/sections/cta-band'
import {ButtonLink} from '@/components/ui/button-link'
import {DirectionalArrow} from '@/components/ui/directional-arrow'
import {PageHeader} from '@/components/ui/page-header'
import {Section} from '@/components/ui/section'
import {getServiceCategories} from '@/lib/data'

type Props = {params: Promise<{locale: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'nav'})
  return {title: t('services')}
}

export default async function ServicesPage({params}: Props) {
  const {locale} = await params
  setRequestLocale(locale)
  const [t, w, nav, categories] = await Promise.all([
    getTranslations('services'),
    getTranslations('whatsapp'),
    getTranslations('nav'),
    getServiceCategories(),
  ])

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Section>
        {categories.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-surface p-8 text-lg text-ink-soft">{t('emptyCatalog')}</p>
        )}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lg">{t('note')}</p>
          <ButtonLink href="/build-package">
            {nav('build')}
            <DirectionalArrow />
          </ButtonLink>
        </div>
      </Section>
      <CtaBand title={t('ctaTitle')} text={t('ctaText')} message={w('services')} />
    </>
  )
}
