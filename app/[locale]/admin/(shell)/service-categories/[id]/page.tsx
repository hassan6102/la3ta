import {getTranslations} from 'next-intl/server'
import {CategoryForm} from '@/components/admin/category-form'
import {ForbiddenState} from '@/components/admin/states'
import {PageTitle} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {notFound} from 'next/navigation'
import {getCategory} from '@/lib/repositories/catalog'

export default async function CategoryEditPage({params}: {params: Promise<{locale: string; id: string}>}) {
  const {locale, id} = await params
  const {allowed} = await adminPage(locale, 'content:write')
  if (!allowed) return <ForbiddenState />
  const t = await getTranslations('admin.categories')
  const category = id === 'new' ? null : await getCategory(id)
  if (id !== 'new' && !category) notFound()

  return (
    <>
      <PageTitle title={category ? t('edit') : t('new')} />
      <CategoryForm category={category} />
    </>
  )
}
