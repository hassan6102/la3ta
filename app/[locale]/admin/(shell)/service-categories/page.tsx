import {ArrowDown, ArrowUp, FolderTree, Pencil, Plus, Power, Trash2} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {ActionButton} from '@/components/admin/action-button'
import {ForbiddenState} from '@/components/admin/states'
import {Badge, EmptyState, PageTitle, outlineButton, primaryButton, tableWrap, td, th, iconButtonClass} from '@/components/admin/ui'
import {Link} from '@/i18n/navigation'
import {adminPage} from '@/lib/admin/page'
import {localize} from '@/lib/localize'
import {listCategories, listServices} from '@/lib/repositories/catalog'
import {deleteCategoryAction, moveCategoryAction, toggleCategoryAction} from './actions'

export default async function CategoriesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'content:write')
  if (!allowed) return <ForbiddenState />
  const [t, c, categories, services] = await Promise.all([getTranslations('admin.categories'), getTranslations('admin.common'), listCategories(), listServices()])

  return (
    <>
      <PageTitle
        title={t('title')}
        description={t('description')}
        actions={
          <Link href="/admin/service-categories/new" className={primaryButton}>
            <Plus aria-hidden className="size-5" />
            {t('new')}
          </Link>
        }
      />
      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title={t('emptyTitle')} text={t('emptyText')}>
          <Link href="/admin/services" className={outlineButton}>
            {(await getTranslations('admin.nav'))('services')}
          </Link>
        </EmptyState>
      ) : (
        <div className={tableWrap}>
          <table className="w-full min-w-[40rem]">
            <thead>
              <tr>
                <th className={th}>{c('name')}</th>
                <th className={th}>{c('status')}</th>
                <th className={th}>{t('servicesCount')}</th>
                <th className={th}>{c('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, i) => (
                <tr key={category.id}>
                  <td className={td}>
                    <p className="font-bold">{localize(category.name, locale)}</p>
                  </td>
                  <td className={td}>
                    <Badge tone={category.active ? 'success' : 'neutral'}>{category.active ? c('active') : c('inactive')}</Badge>
                  </td>
                  <td className={td}>{services.filter((s) => s.categoryId === category.id).length}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1.5">
                      <ActionButton action={moveCategoryAction} fields={{id: category.id, direction: 'up'}} label={c('moveUp')} disabled={i === 0}>
                        <ArrowUp aria-hidden className="size-4" />
                      </ActionButton>
                      <ActionButton action={moveCategoryAction} fields={{id: category.id, direction: 'down'}} label={c('moveDown')} disabled={i === categories.length - 1}>
                        <ArrowDown aria-hidden className="size-4" />
                      </ActionButton>
                      <ActionButton action={toggleCategoryAction} fields={{id: category.id, active: String(!category.active)}} label={category.active ? c('deactivate') : c('activate')}>
                        <Power aria-hidden className="size-4" />
                      </ActionButton>
                      <Link href={`/admin/service-categories/${category.id}`} aria-label={c('edit')} title={c('edit')} className={iconButtonClass}>
                        <Pencil aria-hidden className="size-4" />
                      </Link>
                      <ActionButton action={deleteCategoryAction} fields={{id: category.id}} label={c('delete')} confirm danger>
                        <Trash2 aria-hidden className="size-4" />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
