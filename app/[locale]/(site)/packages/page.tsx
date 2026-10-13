import type {Metadata} from 'next'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {PackageCard} from '@/components/packages/package-card'
import {ButtonLink} from '@/components/ui/button-link'
import {DirectionalArrow} from '@/components/ui/directional-arrow'
import {PageHeader} from '@/components/ui/page-header'
import {Section} from '@/components/ui/section'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {getPackages, getServiceCategories} from '@/lib/data'
import {localize} from '@/lib/localize'

type Props = {params: Promise<{locale: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'nav'})
  return {title: t('packages')}
}

export default async function PackagesPage({params}: Props) {
  const {locale} = await params
  setRequestLocale(locale)
  const [t, w, packages, categories] = await Promise.all([
    getTranslations('packages'),
    getTranslations('whatsapp'),
    getPackages(),
    getServiceCategories(),
  ])

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Section>
        {packages.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-surface p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl">{t('emptyTitle')}</h2>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">{t('emptyText')}</p>
            <p className="mt-8 mb-3 font-bold text-brand">{t('canInclude')}</p>
            <ul className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.id} className="rounded-full border border-line px-4 py-1.5">
                  {localize(category.name, locale)}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/build-package" size="lg">
                {t('buildCta')}
                <DirectionalArrow />
              </ButtonLink>
              <WhatsAppButton size="lg" variant="whatsapp" message={w('packages')} />
            </div>
          </div>
        )}
      </Section>
    </>
  )
}
