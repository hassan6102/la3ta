import type {Metadata} from 'next'
import {MapPin} from 'lucide-react'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {ContactForm} from '@/components/contact/contact-form'
import {PageHeader} from '@/components/ui/page-header'
import {Section} from '@/components/ui/section'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {getServiceCategories, getSiteSettings} from '@/lib/data'
import {localize} from '@/lib/localize'
import {buildWhatsAppUrl} from '@/lib/whatsapp'

type Props = {params: Promise<{locale: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'nav'})
  return {title: t('contact')}
}

export default async function ContactPage({params}: Props) {
  const {locale} = await params
  setRequestLocale(locale)
  const [t, w, settings, categories] = await Promise.all([
    getTranslations('contact'),
    getTranslations('whatsapp'),
    getSiteSettings(),
    getServiceCategories(),
  ])

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <h2 className="mb-4 text-xl">{t('whatsappTitle')}</h2>
              <WhatsAppButton size="lg" className="w-full" message={w('general')} />
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <h2 className="mb-3 text-xl">{t('locationTitle')}</h2>
              <p className="flex items-start gap-2 text-lg text-ink-soft">
                <MapPin aria-hidden className="mt-1.5 size-5 shrink-0 text-brand" />
                {localize(settings.location, locale)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="mb-6 text-xl">{t('formTitle')}</h2>
            <ContactForm
              whatsappBase={buildWhatsAppUrl(settings.whatsappNumber)}
              services={categories.map((c) => ({id: c.id, label: localize(c.name, locale)}))}
            />
          </div>
        </div>
      </Section>
    </>
  )
}
