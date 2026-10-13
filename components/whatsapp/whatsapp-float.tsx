import {MessageCircle} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {getSiteSettings} from '@/lib/data'
import {buildWhatsAppUrl} from '@/lib/whatsapp'

/** Floating WhatsApp button, always reachable on mobile. */
export async function WhatsAppFloat() {
  const [settings, t] = await Promise.all([getSiteSettings(), getTranslations()])
  return (
    <a
      href={buildWhatsAppUrl(settings.whatsappNumber, t('whatsapp.general'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('common.whatsappCta')}
      className="fixed bottom-4 end-4 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-brand-ink shadow-lg shadow-black/40 transition-colors hover:bg-whatsapp-hover"
    >
      <MessageCircle aria-hidden className="size-7" />
    </a>
  )
}
