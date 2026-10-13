import {MapPin} from 'lucide-react'
import {getLocale, getTranslations} from 'next-intl/server'
import {ButtonLink} from '@/components/ui/button-link'
import {Container} from '@/components/ui/container'
import {DirectionalArrow} from '@/components/ui/directional-arrow'
import {CategoryIcon} from '@/components/services/category-icon'
import {Link} from '@/i18n/navigation'
import {getServiceCategories, getSiteSettings} from '@/lib/data'
import {localize} from '@/lib/localize'

export async function Hero() {
  const [t, locale, settings, categories] = await Promise.all([
    getTranslations('hero'),
    getLocale(),
    getSiteSettings(),
    getServiceCategories(),
  ])
  const points = ['point1', 'point2', 'point3'] as const

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="pointer-events-none absolute -top-48 -end-40 size-[34rem] rounded-full bg-brand/10 blur-3xl" />
      <Container className="relative grid items-center gap-12 py-12 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-semibold text-brand">
            <MapPin aria-hidden className="size-4" />
            {t('eyebrow')} · {localize(settings.location, locale)}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl">
            {t('title')} <span className="text-brand">{t('highlight')}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">{t('description')}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/packages" size="lg">
              {t('packages')}
              <DirectionalArrow />
            </ButtonLink>
            <ButtonLink href="/build-package" variant="outline" size="lg">
              {t('build')}
            </ButtonLink>
          </div>
          <p className="mt-5">
            <Link href="/services" className="font-bold text-brand underline-offset-4 hover:underline">
              {t('services')}
            </Link>
          </p>
          <ul className="mt-8 space-y-1 text-ink-soft">
            {points.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <span aria-hidden className="size-2 rounded-full bg-brand" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid grid-cols-2 gap-4" aria-hidden>
          {categories.map((category) => (
            <li key={category.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <span className="mb-4 grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <CategoryIcon id={category.id} className="size-6" />
              </span>
              <p className="text-lg font-bold">{localize(category.name, locale)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
