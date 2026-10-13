'use client'

import {Loader2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useFormStatus} from 'react-dom'
import {cn} from '@/lib/utils'
import {primaryButton} from './ui'

export function SubmitButton({children, className}: {children?: React.ReactNode; className?: string}) {
  const {pending} = useFormStatus()
  const t = useTranslations('admin.common')
  return (
    <button type="submit" disabled={pending} className={cn(primaryButton, className)}>
      {pending && <Loader2 aria-hidden className="size-5 animate-spin" />}
      {pending ? t('saving') : (children ?? t('save'))}
    </button>
  )
}
