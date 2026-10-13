import {ArrowDown, ArrowUp, Boxes, Pencil, Plus, Power, Trash2} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {ActionButton} from '@/components/admin/action-button'
import {SeedButton} from '@/components/admin/seed-button'
import {ForbiddenState} from '@/components/admin/states'
import {Badge, Card, EmptyState, PageTitle, iconButtonClass, primaryButton, tableWrap, td, th} from '@/components/admin/ui'
import {Link} from '@/i18n/navigation'
import {adminPage} from '@/lib/admin/page'
import {localize} from '@/lib/localize'
import {formatPiasters} from '@/lib/money'
import {listCategories, listServices} from '@/lib/repositories/catalog'
import {readSiteSettings} from '@/lib/repositories/settings'
import {deleteServiceAction, moveServiceAction, toggleServiceAction} from './actions'

export default async function ServicesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'content:write')
  if (!allowed) return <ForbiddenState />
  const [t, c, categories, services, {settings}] = await Promise.all([
    getTranslations('admin.services'),
    getTranslations('admin.common'),
    listCategories(),
    listServices(),
    readSiteSettings(),
  ])

  const importCard = (
    <Card className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg">{t('importTitle')}</h2>
        <p className="text-ink-soft">{t('importText')}</p>
      </div>
      <SeedButton />
    </Card>
  )

  return (
    <>
      <PageTitle
        title={t('title')}
        description={t('description')}
        actions={
          <Link href="/admin/services/new" className={primaryButton}>
            <Plus aria-hidden className="size-5" />
            {t('new')}
          </Link>
        }
      />
      {services.length === 0 ? (
        <>
          {importCard}
          <EmptyState icon={Boxes} title={t('emptyTitle')} text={t('emptyText')} />
        </>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const items = services.filter((s) => s.categoryId === category.id)
            if (items.length === 0) return null
            return (
              <section key={category.id}>
                <h2 className="mb-3 text-xl">{localize(category.name, locale)}</h2>
                <div className={tableWrap}>
                  <table className="w-full min-w-[44rem]">
                    <thead>
                      <tr>
                        <th className={th}>{c('name')}</th>
                        <th className={th}>{c('price')}</th>
                        <th className={th}>{c('status')}</th>
                        <th className={th}>{c('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((service, i) => (
                        <tr key={service.id}>
                          <td className={td}>
                            <p className="font-bold">{localize(service.name, locale)}</p>
                          </td>
                          <td className={td}>
                            {service.pricing.unitPrice === null ? (
                              <span className="text-ink-soft">{t('noPrice')}</span>
                            ) : (
                              <span>
                                {formatPiasters(service.pricing.unitPrice, settings.defaultCurrency, locale)}{' '}
                                <span className="text-sm text-ink-soft">{t(`units.${service.pricing.unit}`)}</span>
                              </span>
                            )}
                          </td>
                          <td className={td}>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge tone={service.active ? 'success' : 'neutral'}>{service.active ? c('active') : c('inactive')}</Badge>
                              {service.builder.enabled && <Badge tone="warning">{t('builderTitle')}</Badge>}
                            </div>
                          </td>
                          <td className={td}>
                            <div className="flex flex-wrap gap-1.5">
                              <ActionButton action={moveServiceAction} fields={{id: service.id, direction: 'up'}} label={c('moveUp')} disabled={i === 0}>
                                <ArrowUp aria-hidden className="size-4" />
                              </ActionButton>
                              <ActionButton action={moveServiceAction} fields={{id: service.id, direction: 'down'}} label={c('moveDown')} disabled={i === items.length - 1}>
                                <ArrowDown aria-hidden className="size-4" />
                              </ActionButton>
                              <ActionButton action={toggleServiceAction} fields={{id: service.id, active: String(!service.active)}} label={service.active ? c('deactivate') : c('activate')}>
                                <Power aria-hidden className="size-4" />
                              </ActionButton>
                              <Link href={`/admin/services/${service.id}`} aria-label={c('edit')} title={c('edit')} className={iconButtonClass}>
                                <Pencil aria-hidden className="size-4" />
                              </Link>
                              <ActionButton action={deleteServiceAction} fields={{id: service.id}} label={c('delete')} confirm danger>
                                <Trash2 aria-hidden className="size-4" />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
