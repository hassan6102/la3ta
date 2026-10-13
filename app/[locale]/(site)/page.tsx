import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CtaBand} from '@/components/sections/cta-band'
import {Hero} from '@/components/sections/hero'
import {PackageOptions} from '@/components/sections/package-options'
import {ProcessSteps} from '@/components/sections/process-steps'
import {ServicesOverview} from '@/components/sections/services-overview'

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const w = await getTranslations('whatsapp')

  return (
    <>
      <Hero />
      <ServicesOverview />
      <PackageOptions />
      <ProcessSteps />
      <CtaBand title={t('ctaTitle')} text={t('ctaText')} message={w('help')} />
    </>
  )
}
