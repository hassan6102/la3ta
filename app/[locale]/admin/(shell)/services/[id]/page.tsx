import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {ServiceForm} from '@/components/admin/service-form'
import {ForbiddenState} from '@/components/admin/states'
import {PageTitle} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {can} from '@/lib/auth/roles'
import {localize} from '@/lib/localize'
import {getService, listCategories} from '@/lib/repositories/catalog'

export default async function ServiceEditPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params
  const {session, allowed} = await adminPage(locale, 'content:write')
  if (!allowed) return <ForbiddenState />
  const [t, categories] = await Promise.all([getTranslations('admin.services'), listCategories()])
  const service = id === 'new' ? null : await getService(id)
  if (id !== 'new' && !service) notFound()

  return (
    <>
      <PageTitle title={service ? t('edit') : t('new')} />
      <ServiceForm
        service={service}
        categories={categories.map((c) => ({id: c.id, label: localize(c.name, locale)}))}
        canPrice={can(session.role, 'pricing:write')}
      />
    </>
  )
}
