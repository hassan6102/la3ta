'use client'

import {useState} from 'react'
import {MessageCircle} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {cn} from '@/lib/utils'

type Props = {
  /** https://wa.me/<number>, built on the server from site settings. */
  whatsappBase: string
  services: {id: string; label: string}[]
}

type Errors = Partial<Record<'name' | 'phone' | 'message', string>>

const EG_MOBILE = /^(?:\+?20|0)?1[0125]\d{8}$/

function normalizePhone(value: string) {
  return value
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s-]/g, '')
}

const fieldClass =
  'w-full rounded-xl border bg-canvas px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 focus:border-brand'

/** No backend yet (Phase 1): validates, then opens WhatsApp with a prefilled message. */
export function ContactForm({whatsappBase, services}: Props) {
  const t = useTranslations('contact')
  const [errors, setErrors] = useState<Errors>({})

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const service = String(data.get('service') ?? '')
    const message = String(data.get('message') ?? '').trim()

    const next: Errors = {}
    if (!name) next.name = t('errors.nameRequired')
    if (phone && !EG_MOBILE.test(normalizePhone(phone))) next.phone = t('errors.phoneInvalid')
    if (!message) next.message = t('errors.messageRequired')
    setErrors(next)
    if (Object.keys(next).length) return

    const lines = [t('msg.greeting', {name})]
    if (service) lines.push(t('msg.service', {service}))
    if (phone) lines.push(t('msg.phone', {phone}))
    lines.push('', message)
    window.open(`${whatsappBase}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer')
  }

  const error = (id: keyof Errors) =>
    errors[id] ? (
      <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-red-400">
        {errors[id]}
      </p>
    ) : null

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block font-bold">
          {t('name')}
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={cn(fieldClass, errors.name ? 'border-red-400' : 'border-line')}
        />
        {error('name')}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block font-bold">
          {t('phone')}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t('phonePlaceholder')}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={cn(fieldClass, errors.phone ? 'border-red-400' : 'border-line')}
        />
        {error('phone')}
      </div>

      <div>
        <label htmlFor="service" className="mb-1.5 block font-bold">
          {t('service')}
        </label>
        <select id="service" name="service" defaultValue="" className={cn(fieldClass, 'border-line')}>
          <option value="">{t('serviceAny')}</option>
          {services.map((s) => (
            <option key={s.id} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block font-bold">
          {t('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={t('messagePlaceholder')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className={cn(fieldClass, errors.message ? 'border-red-400' : 'border-line')}
        />
        {error('message')}
      </div>

      <button
        type="submit"
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-8 text-lg font-bold text-brand-ink transition-colors hover:bg-whatsapp-hover"
      >
        <MessageCircle aria-hidden className="size-5" />
        {t('submit')}
      </button>
      <p className="text-sm text-ink-soft">{t('hint')}</p>
    </form>
  )
}
