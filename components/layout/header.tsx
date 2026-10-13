import {Clapperboard} from 'lucide-react'
import {getLocale, getTranslations} from 'next-intl/server'
import {Container} from '@/components/ui/container'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'
import {Link} from '@/i18n/navigation'
import {getSiteSettings} from '@/lib/data'
import {localize} from '@/lib/localize'
import {NAV_ITEMS} from '@/lib/nav'
import {LanguageSwitcher} from './language-switcher'
import {DesktopNav, MobileMenu} from './nav'

export async function Header() {
  const [settings, t, locale] = await Promise.all([getSiteSettings(), getTranslations(), getLocale()])
  const links = NAV_ITEMS.map((item) => ({href: item.href, label: t(`nav.${item.key}`)}))

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink">
            <Clapperboard aria-hidden className="size-5" />
          </span>
          <span className="truncate">{localize(settings.studioName, locale)}</span>
        </Link>

        <DesktopNav links={links} label={t('common.menu')} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher label={t('common.switchLanguage')} />
          <div className="hidden xl:block">
            <WhatsAppButton message={t('whatsapp.general')} label={t('common.whatsapp')} className="min-h-11 px-4 text-sm" />
          </div>
          <MobileMenu links={links} label={t('common.menu')} openLabel={t('common.openMenu')} closeLabel={t('common.closeMenu')}>
            <WhatsAppButton message={t('whatsapp.general')} className="w-full" />
          </MobileMenu>
        </div>
      </Container>
    </header>
  )
}
