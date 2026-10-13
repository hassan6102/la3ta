import type {Metadata} from 'next'
import {Check} from 'lucide-react'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {PageHeader} from '@/components/ui/page-header'
import {Section} from '@/components/ui/section'
import {PackageBuilder} from '@/components/builder/package-builder'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {getBuilderData, getSiteSettings} from '@/lib/data'

type Props = {params: Promise<{locale: string}>}

const OPTIONS = ['lectures', 'quality', 'cameras', 'editing', 'thumbnails', 'social', 'shorts', 'subtitles', 'motion'] as const

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'builder'})
  return {title: t('title')}
}

/**
 * Live builder when the admin has configured buildable, priced services in Firestore;
 * otherwise the original "not available yet" state, so the page never shows an empty tool.
 */
export default async function BuildPackagePage({params}: Props) {
  const {locale} = await params
  setRequestLocale(locale)
  const [t, w, data, settings] = await Promise.all([getTranslations('builder'), getTranslations('whatsapp'), getBuilderData(), getSiteSettings()])

  if (data) {
    return (
      <>
        <PageHeader title={t('title')} description={t('description')} />
        <Section>
          <PackageBuilder config={data.config} categories={data.categories} notes={data.notes} whatsappNumber={settings.whatsappNumber} />
        </Section>
      </>
    )
  }

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Section>
        <div className="max-w-3xl rounded-3xl border border-line bg-surface p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl">{t('soonTitle')}</h2>
          <p className="mt-3 text-lg text-ink-soft">{t('soonText')}</p>
          <p className="mt-8 mb-3 font-bold text-brand">{t('youWillChoose')}</p>
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {OPTIONS.map((key) => (
              <li key={key} className="flex items-start gap-2 py-1">
                <Check aria-hidden className="mt-1.5 size-4 shrink-0 text-brand" />
                {t(`options.${key}`)}
              </li>
            ))}
          </ul>
          <p className="mt-8 mb-4 text-ink-soft">{t('meanwhile')}</p>
          <WhatsAppButton size="lg" message={w('custom')} />
        </div>
      </Section>
    </>
  )
}
