import {getTranslations} from 'next-intl/server'
import {ForbiddenState} from '@/components/admin/states'
import {SettingsForm} from '@/components/admin/settings-form'
import {PageTitle} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {readSiteSettings} from '@/lib/repositories/settings'

export default async function SettingsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'settings:write')
  if (!allowed) return <ForbiddenState />
  const [t, {settings, exists}] = await Promise.all([getTranslations('admin.settings'), readSiteSettings()])

  return (
    <>
      <PageTitle title={t('title')} description={exists ? t('description') : `${t('description')} ${t('notSaved')}`} />
      <SettingsForm settings={settings} />
    </>
  )
}
