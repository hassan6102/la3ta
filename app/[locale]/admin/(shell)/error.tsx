'use client'

import {AlertTriangle} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {Card, outlineButton} from '@/components/admin/ui'

export default function AdminError({reset}: {error: Error; reset: () => void}) {
  const t = useTranslations('admin')
  return (
    <Card className="mx-auto max-w-lg py-12 text-center">
      <AlertTriangle aria-hidden className="mx-auto mb-4 size-10 text-amber-300" />
      <h1 className="text-2xl">{t('states.errorTitle')}</h1>
      <p className="mt-2 text-ink-soft">{t('states.errorText')}</p>
      <button type="button" onClick={reset} className={`${outlineButton} mt-6`}>
        {t('common.retry')}
      </button>
    </Card>
  )
}
