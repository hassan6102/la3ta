import {AlertTriangle, ShieldAlert} from 'lucide-react'
import {getTranslations} from 'next-intl/server'
import {Card} from './ui'

export async function ForbiddenState() {
  const t = await getTranslations('admin.forbidden')
  return (
    <Card className="mx-auto max-w-lg py-12 text-center">
      <ShieldAlert aria-hidden className="mx-auto mb-4 size-10 text-brand" />
      <h1 className="text-2xl">{t('title')}</h1>
      <p className="mt-2 text-ink-soft">{t('text')}</p>
    </Card>
  )
}

export async function NotConfiguredState() {
  const t = await getTranslations('admin.states')
  return (
    <Card className="mx-auto max-w-lg py-12 text-center">
      <AlertTriangle aria-hidden className="mx-auto mb-4 size-10 text-amber-300" />
      <h1 className="text-2xl">{t('notConfiguredTitle')}</h1>
      <p className="mt-2 text-ink-soft">{t('notConfiguredText')}</p>
    </Card>
  )
}

export async function ComingSoon({name, icon: Icon}: {name: 'discounts' | 'coupons' | 'orders' | 'portfolio' | 'reviews' | 'files'; icon: React.ElementType}) {
  const [t, nav, soon] = await Promise.all([getTranslations('admin.soon'), getTranslations('admin.nav'), getTranslations(`admin.soon.${name}`)])
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl">{nav(name)}</h1>
        <p className="mt-1 text-ink-soft">{soon('text')}</p>
      </div>
      <Card className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
            <Icon aria-hidden className="size-6" />
          </span>
          <span className="rounded-full border border-brand/50 bg-brand/10 px-3 py-0.5 text-sm font-bold text-brand">{t('badge')}</span>
        </div>
        <h2 className="mb-2 text-lg">{t('plannedTitle')}</h2>
        <ul className="space-y-1 text-ink-soft">
          {(['b1', 'b2', 'b3'] as const).map((k) => (
            <li key={k} className="flex gap-2">
              <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-brand" />
              {soon(k)}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
