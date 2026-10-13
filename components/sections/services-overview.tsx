import {getLocale, getTranslations} from 'next-intl/server'
import {Section, SectionHeading} from '@/components/ui/section'
import {ButtonLink} from '@/components/ui/button-link'
import {DirectionalArrow} from '@/components/ui/directional-arrow'
import {CategoryCard} from '@/components/services/category-card'
import {getServiceCategories} from '@/lib/data'

export async function ServicesOverview() {
  const [t, nav, locale, categories] = await Promise.all([
    getTranslations('home'),
    getTranslations('nav'),
    getLocale(),
    getServiceCategories(),
  ])
  return (
    <Section>
      <SectionHeading title={t('servicesTitle')} description={t('servicesText')} />
      <div className="grid gap-5 sm:grid-cols-2">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} locale={locale} showItems={false} />
        ))}
      </div>
      <div className="mt-8">
        <ButtonLink href="/services" variant="outline">
          {nav('services')}
          <DirectionalArrow />
        </ButtonLink>
      </div>
    </Section>
  )
}
