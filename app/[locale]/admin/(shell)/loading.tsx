import {Loader2} from 'lucide-react'
import {getTranslations} from 'next-intl/server'

export default async function Loading() {
  const t = await getTranslations('admin.common')
  return (
    <div role="status" className="flex items-center gap-3 py-16 text-ink-soft">
      <Loader2 aria-hidden className="size-6 animate-spin text-brand" />
      {t('loading')}
    </div>
  )
}
