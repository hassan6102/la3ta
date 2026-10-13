'use client'

import {Download} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {seedCatalogAction} from '@/app/[locale]/admin/(shell)/services/actions'
import {ActionButton} from './action-button'

export function SeedButton() {
  const t = useTranslations('admin.services')
  return (
    <ActionButton action={seedCatalogAction} fields={{}} label={t('importButton')} text>
      <Download aria-hidden className="size-4" />
    </ActionButton>
  )
}
