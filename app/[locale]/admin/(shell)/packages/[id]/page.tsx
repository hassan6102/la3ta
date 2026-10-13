import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {PackageForm} from '@/components/admin/package-form'
import {ForbiddenState} from '@/components/admin/states'
import {PageTitle} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {can} from '@/lib/auth/roles'
import {localize} from '@/lib/localize'
import {listServices} from '@/lib/repositories/catalog'
import {getPackage} from '@/lib/repositories/packages'

export default async function PackageEditPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params
  const {session, allowed} = await adminPage(locale, 'content:write')
  const canPrice = can(session.role, 'pricing:write')
  // Creating a package sets a price, so editors can only edit existing ones.
  if (!allowed || (id === 'new' && !canPrice)) return <ForbiddenState />
  const [t, services] = await Promise.all([getTranslations('admin.packages'), listServices()])
  const pkg = id === 'new' ? null : await getPackage(id)
  if (id !== 'new' && !pkg) notFound()

  return (
    <>
      <PageTitle title={pkg ? t('edit') : t('new')} />
      <PackageForm pkg={pkg} services={services.map((s) => ({id: s.id, label: localize(s.name, locale)}))} canPrice={canPrice} />
    </>
  )
}
