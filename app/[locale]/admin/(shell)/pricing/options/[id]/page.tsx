import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {OptionForm} from '@/components/admin/option-form'
import {ForbiddenState} from '@/components/admin/states'
import {PageTitle} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {localize} from '@/lib/localize'
import {listServices} from '@/lib/repositories/catalog'
import {getOption} from '@/lib/repositories/pricing'

export default async function OptionEditPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params
  const {allowed} = await adminPage(locale, 'pricing:write')
  if (!allowed) return <ForbiddenState />
  const [t, services] = await Promise.all([getTranslations('admin.pricing'), listServices()])
  const option = id === 'new' ? null : await getOption(id)
  if (id !== 'new' && !option) notFound()

  return (
    <>
      <PageTitle title={option ? t('editOption') : t('newOption')} />
      <OptionForm option={option} services={services.filter((s) => s.builder.enabled).map((s) => ({id: s.id, label: localize(s.name, locale)}))} />
    </>
  )
}
