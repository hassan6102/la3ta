import {Package, SlidersHorizontal} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {ButtonLink} from '@/components/ui/button-link'
import {DirectionalArrow} from '@/components/ui/directional-arrow'
import {Section, SectionHeading} from '@/components/ui/section'

export async function PackageOptions() {
  const t = await getTranslations('home')
  return (
    <Section className="bg-surface">
      <SectionHeading title={t('optionsTitle')} />
      <div className="grid gap-5 md:grid-cols-2">
        <article className="flex flex-col items-start rounded-2xl border border-line bg-canvas p-6 sm:p-8">
          <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Package aria-hidden className="size-7" />
          </span>
          <h3 className="text-2xl">{t('readyTitle')}</h3>
          <p className="mt-2 mb-6 flex-1 text-ink-soft">{t('readyText')}</p>
          <ButtonLink href="/packages">
            {t('readyCta')}
            <DirectionalArrow />
          </ButtonLink>
        </article>
        <article className="flex flex-col items-start rounded-2xl border border-brand/50 bg-canvas p-6 sm:p-8">
          <span className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <SlidersHorizontal aria-hidden className="size-7" />
          </span>
          <h3 className="text-2xl">{t('buildTitle')}</h3>
          <p className="mt-2 mb-6 flex-1 text-ink-soft">{t('buildText')}</p>
          <ButtonLink href="/build-package">
            {t('buildCta')}
            <DirectionalArrow />
          </ButtonLink>
        </article>
      </div>
    </Section>
  )
}
