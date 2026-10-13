import {ArrowDown, ArrowUp, Package, Pencil, Plus, Power, Star, Trash2} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {ActionButton} from '@/components/admin/action-button'
import {ForbiddenState} from '@/components/admin/states'
import {Badge, EmptyState, PageTitle, iconButtonClass, primaryButton, tableWrap, td, th} from '@/components/admin/ui'
import {Link} from '@/i18n/navigation'
import {adminPage} from '@/lib/admin/page'
import {can} from '@/lib/auth/roles'
import {localize} from '@/lib/localize'
import {formatPiasters} from '@/lib/money'
import {listPackages} from '@/lib/repositories/packages'
import {readSiteSettings} from '@/lib/repositories/settings'
import {deletePackageAction, movePackageAction, togglePackageAction} from './actions'

export default async function PackagesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {session, allowed} = await adminPage(locale, 'content:write')
  if (!allowed) return <ForbiddenState />
  const [t, c, packages, {settings}] = await Promise.all([getTranslations('admin.packages'), getTranslations('admin.common'), listPackages(), readSiteSettings()])
  const money = (p: number) => formatPiasters(p, settings.defaultCurrency, locale)
  const canCreate = can(session.role, 'pricing:write')

  return (
    <>
      <PageTitle
        title={t('title')}
        description={canCreate ? t('description') : `${t('description')} ${t('editorCannotCreate')}`}
        actions={
          canCreate && (
            <Link href="/admin/packages/new" className={primaryButton}>
              <Plus aria-hidden className="size-5" />
              {t('new')}
            </Link>
          )
        }
      />
      {packages.length === 0 ? (
        <EmptyState icon={Package} title={t('emptyTitle')} text={t('emptyText')}>
          {canCreate && (
            <Link href="/admin/packages/new" className={primaryButton}>
              {t('new')}
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className={tableWrap}>
          <table className="w-full min-w-[48rem]">
            <thead>
              <tr>
                <th className={th}>{c('name')}</th>
                <th className={th}>{c('price')}</th>
                <th className={th}>{c('status')}</th>
                <th className={th}>{c('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, i) => {
                const discount = pkg.originalPrice ? Math.round((1 - pkg.price / pkg.originalPrice) * 100) : 0
                return (
                  <tr key={pkg.id}>
                    <td className={td}>
                      <p className="font-bold">{localize(pkg.name, locale)}</p>
                      <p className="text-sm text-ink-soft">
                        {pkg.includes.length} {t('servicesIncluded')}
                      </p>
                    </td>
                    <td className={td}>
                      <span className="font-bold">{money(pkg.price)}</span>
                      {pkg.originalPrice !== null && (
                        <span className="ms-2 text-sm text-ink-soft">
                          <s>{money(pkg.originalPrice)}</s> <Badge tone="success">{discount}% {t('discount')}</Badge>
                        </span>
                      )}
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={pkg.active ? 'success' : 'neutral'}>{pkg.active ? c('active') : c('inactive')}</Badge>
                        {pkg.featured && <Badge tone="warning">{t('featured')}</Badge>}
                      </div>
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1.5">
                        <ActionButton action={movePackageAction} fields={{id: pkg.id, direction: 'up'}} label={c('moveUp')} disabled={i === 0}>
                          <ArrowUp aria-hidden className="size-4" />
                        </ActionButton>
                        <ActionButton action={movePackageAction} fields={{id: pkg.id, direction: 'down'}} label={c('moveDown')} disabled={i === packages.length - 1}>
                          <ArrowDown aria-hidden className="size-4" />
                        </ActionButton>
                        <ActionButton action={togglePackageAction} fields={{id: pkg.id, flag: 'featured', value: String(!pkg.featured)}} label={t('featured')}>
                          <Star aria-hidden className={`size-4 ${pkg.featured ? 'fill-current text-brand' : ''}`} />
                        </ActionButton>
                        <ActionButton action={togglePackageAction} fields={{id: pkg.id, flag: 'active', value: String(!pkg.active)}} label={pkg.active ? c('deactivate') : c('activate')}>
                          <Power aria-hidden className="size-4" />
                        </ActionButton>
                        <Link href={`/admin/packages/${pkg.id}`} aria-label={c('edit')} title={c('edit')} className={iconButtonClass}>
                          <Pencil aria-hidden className="size-4" />
                        </Link>
                        <ActionButton action={deletePackageAction} fields={{id: pkg.id}} label={c('delete')} confirm danger>
                          <Trash2 aria-hidden className="size-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
