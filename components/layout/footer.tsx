import {MapPin} from 'lucide-react'
import {getLocale, getTranslations} from 'next-intl/server'
import {Container} from '@/components/ui/container'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {Link} from '@/i18n/navigation'
import {getSiteSettings} from '@/lib/data'
import {localize} from '@/lib/localize'
import {NAV_ITEMS} from '@/lib/nav'

export async function Footer() {
  const [settings, t, locale] = await Promise.all([getSiteSettings(), getTranslations(), getLocale()])
  const name = localize(settings.studioName, locale)

  return (
    <footer className="mt-10 border-t border-line bg-surface">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="text-xl font-extrabold">{name}</p>
          <p className="mt-3 max-w-xs text-ink-soft">{t('footer.tagline')}</p>
        </div>
        <nav aria-label={t('footer.explore')}>
          <p className="mb-3 font-bold text-brand">{t('footer.explore')}</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-block py-1 text-ink-soft transition-colors hover:text-brand">
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-3 font-bold text-brand">{t('footer.contact')}</p>
          <p className="mb-4 flex items-start gap-2 text-ink-soft">
            <MapPin aria-hidden className="mt-1.5 size-5 shrink-0" />
            {localize(settings.location, locale)}
          </p>
          <WhatsAppButton message={t('whatsapp.general')} />
        </div>
      </Container>
      <div className="border-t border-line py-5 text-center text-sm text-ink-soft">
        {t('footer.rights', {year: new Date().getFullYear(), name})}
      </div>
    </footer>
  )
}
