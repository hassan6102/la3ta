import {ArrowDown, ArrowUp, Pencil, Plus, Power, SlidersHorizontal, Trash2} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {ActionButton} from '@/components/admin/action-button'
import {BuilderConfigForm} from '@/components/admin/builder-config-form'
import {ForbiddenState} from '@/components/admin/states'
import {Badge, Card, EmptyState, PageTitle, iconButtonClass, outlineButton, primaryButton, tableWrap, td, th} from '@/components/admin/ui'
import {Link} from '@/i18n/navigation'
import {adminPage} from '@/lib/admin/page'
import {localize} from '@/lib/localize'
import {formatPiasters} from '@/lib/money'
import {getPricingRevision} from '@/lib/repositories/base'
import {listServices} from '@/lib/repositories/catalog'
import {getBuilderConfig, listOptions} from '@/lib/repositories/pricing'
import {readSiteSettings} from '@/lib/repositories/settings'
import {deleteOptionAction, moveOptionAction, toggleOptionAction} from './actions'

export default async function PricingPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'pricing:write')
  if (!allowed) return <ForbiddenState />
  const [t, c, services, options, config, revision, {settings}] = await Promise.all([
    getTranslations('admin.pricing'),
    getTranslations('admin.common'),
    listServices(),
    listOptions(),
    getBuilderConfig(),
    getPricingRevision(),
    readSiteSettings(),
  ])
  const buildable = services.filter((s) => s.builder.enabled && s.pricing.unitPrice !== null)
  const sUnits = await getTranslations('admin.services.units')

  return (
    <div className="space-y-10">
      <PageTitle title={t('title')} description={`${t('description')} · ${t('revision')}: ${revision}`} />

      <BuilderConfigForm config={config} />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl">{t('buildableTitle')}</h2>
            <p className="text-ink-soft">{t('buildableText')}</p>
          </div>
          <Link href="/admin/services" className={outlineButton}>
            {(await getTranslations('admin.nav'))('services')}
          </Link>
        </div>
        {buildable.length === 0 ? (
          <Card className="text-ink-soft">{t('noBuildable')}</Card>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[36rem]">
              <thead>
                <tr>
                  <th className={th}>{c('name')}</th>
                  <th className={th}>{c('price')}</th>
                  <th className={th}>
                    {c('status')}
                  </th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {buildable.map((s) => (
                  <tr key={s.id}>
                    <td className={td}>{localize(s.name, locale)}</td>
                    <td className={td}>
                      {formatPiasters(s.pricing.unitPrice ?? 0, settings.defaultCurrency, locale)} <span className="text-sm text-ink-soft">{sUnits(s.pricing.unit)}</span>
                    </td>
                    <td className={td}>
                      <Badge tone={s.active ? 'success' : 'neutral'}>{s.active ? c('active') : c('inactive')}</Badge>
                    </td>
                    <td className={td}>
                      <Link href={`/admin/services/${s.id}`} aria-label={c('edit')} title={c('edit')} className={iconButtonClass}>
                        <Pencil aria-hidden className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl">{t('optionsTitle')}</h2>
            <p className="max-w-2xl text-ink-soft">{t('optionsText')}</p>
          </div>
          <Link href="/admin/pricing/options/new" className={primaryButton}>
            <Plus aria-hidden className="size-5" />
            {t('newOption')}
          </Link>
        </div>
        {options.length === 0 ? (
          <EmptyState icon={SlidersHorizontal} title={t('emptyOptions')} />
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[40rem]">
              <thead>
                <tr>
                  <th className={th}>{c('name')}</th>
                  <th className={th}>{t('type')}</th>
                  <th className={th}>{c('status')}</th>
                  <th className={th}>{c('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {options.map((o, i) => (
                  <tr key={o.id}>
                    <td className={td}>
                      <p className="font-bold">{localize(o.name, locale)}</p>
                      <p className="text-sm text-ink-soft">{o.choices.length} {t('choices')}</p>
                    </td>
                    <td className={td}>{o.type === 'toggle' ? t('toggle') : t('select')}{o.required && <> · <Badge tone="warning">{t('required')}</Badge></>}</td>
                    <td className={td}>
                      <Badge tone={o.active ? 'success' : 'neutral'}>{o.active ? c('active') : c('inactive')}</Badge>
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1.5">
                        <ActionButton action={moveOptionAction} fields={{id: o.id, direction: 'up'}} label={c('moveUp')} disabled={i === 0}>
                          <ArrowUp aria-hidden className="size-4" />
                        </ActionButton>
                        <ActionButton action={moveOptionAction} fields={{id: o.id, direction: 'down'}} label={c('moveDown')} disabled={i === options.length - 1}>
                          <ArrowDown aria-hidden className="size-4" />
                        </ActionButton>
                        <ActionButton action={toggleOptionAction} fields={{id: o.id, active: String(!o.active)}} label={o.active ? c('deactivate') : c('activate')}>
                          <Power aria-hidden className="size-4" />
                        </ActionButton>
                        <Link href={`/admin/pricing/options/${o.id}`} aria-label={c('edit')} title={c('edit')} className={iconButtonClass}>
                          <Pencil aria-hidden className="size-4" />
                        </Link>
                        <ActionButton action={deleteOptionAction} fields={{id: o.id}} label={c('delete')} confirm danger>
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
      </section>
    </div>
  )
}
