import {Boxes, Calculator, Check, FolderTree, Package, SlidersHorizontal} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {Badge, Card, PageTitle, outlineButton} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {Link} from '@/i18n/navigation'
import {listCategories, listServices} from '@/lib/repositories/catalog'
import {listPackages} from '@/lib/repositories/packages'
import {listOptions} from '@/lib/repositories/pricing'
import {readSiteSettings} from '@/lib/repositories/settings'
import {can} from '@/lib/auth/roles'

export default async function OverviewPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {session} = await adminPage(locale)
  const [t, categories, services, packages, options, site] = await Promise.all([
    getTranslations('admin.overview'),
    listCategories(),
    listServices(),
    listPackages(),
    listOptions(),
    readSiteSettings(),
  ])

  const priced = services.filter((s) => s.pricing.unitPrice !== null).length
  const activePackages = packages.filter((p) => p.active).length

  const stats = [
    {label: t('categories'), value: categories.length, icon: FolderTree},
    {label: t('services'), value: services.length, icon: Boxes},
    {label: t('priced'), value: `${priced}/${services.length}`, icon: Calculator},
    {label: t('packages'), value: activePackages, icon: Package},
    {label: t('options'), value: options.length, icon: SlidersHorizontal},
  ]

  const checks = [
    {label: t('checkCatalog'), done: categories.length > 0 && services.length > 0, href: '/admin/services'},
    {label: t('checkSettings'), done: site.exists, href: '/admin/settings', hidden: !can(session.role, 'settings:write')},
    {label: t('checkWhatsapp'), done: site.settings.whatsappNumber !== '', href: '/admin/settings', hidden: !can(session.role, 'settings:write')},
    {label: t('checkPrices'), done: priced > 0, href: '/admin/services'},
    {label: t('checkPackage'), done: packages.length > 0, href: '/admin/packages'},
  ].filter((c) => !c.hidden)

  return (
    <>
      <PageTitle title={t('title')} description={t('welcome')} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(({label, value, icon: Icon}) => (
          <Card key={label} className="p-4 sm:p-5">
            <Icon aria-hidden className="mb-3 size-6 text-brand" />
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="text-sm text-ink-soft">{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-4 text-xl">{t('setupTitle')}</h2>
        <ul className="divide-y divide-line/60">
          {checks.map((check) => (
            <li key={check.label} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-3">
                <span className={`grid size-6 place-items-center rounded-full ${check.done ? 'bg-brand text-brand-ink' : 'border border-line'}`}>
                  {check.done && <Check aria-hidden className="size-4" />}
                </span>
                {check.label}
              </span>
              {check.done ? (
                <Badge tone="success">{t('done')}</Badge>
              ) : (
                <Link href={check.href} className={`${outlineButton} min-h-9 px-3 text-sm`}>
                  {t('open')}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
