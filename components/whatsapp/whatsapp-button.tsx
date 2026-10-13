import {MessageCircle} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {ButtonLink} from '@/components/ui/button-link'
import {getSiteSettings} from '@/lib/data'
import {buildWhatsAppUrl} from '@/lib/whatsapp'

type Props = {
  message?: string
  label?: string
  variant?: 'whatsapp' | 'outline' | 'primary'
  size?: 'md' | 'lg'
  className?: string
}

/** WhatsApp CTA. The number always comes from site settings (Admin > Settings in later phases). */
export async function WhatsAppButton({message, label, variant = 'whatsapp', size, className}: Props) {
  const [settings, t] = await Promise.all([getSiteSettings(), getTranslations('common')])
  return (
    <ButtonLink external href={buildWhatsAppUrl(settings.whatsappNumber, message)} variant={variant} size={size} className={className}>
      <MessageCircle aria-hidden className="size-5" />
      {label ?? t('whatsappCta')}
    </ButtonLink>
  )
}
