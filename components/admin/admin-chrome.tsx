'use client'

import {
  Boxes,
  Calculator,
  Clapperboard,
  ExternalLink,
  FolderTree,
  Files,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Ticket,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import {useEffect, useState} from 'react'
import {LanguageSwitcher} from '@/components/layout/language-switcher'
import {Link, usePathname, useRouter} from '@/i18n/navigation'
import {cn} from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  services: Boxes,
  categories: FolderTree,
  packages: Package,
  pricing: Calculator,
  discounts: Percent,
  coupons: Ticket,
  orders: ShoppingBag,
  portfolio: Images,
  reviews: Star,
  files: Files,
  settings: Settings,
  users: Users,
}

export type ChromeGroup = {title: string; items: {href: string; label: string; icon: string}[]}

type Props = {
  groups: ChromeGroup[]
  studioName: string
  user: {email: string; roleLabel: string}
  labels: {openMenu: string; closeMenu: string; viewSite: string; signOut: string; switchLanguage: string; dashboard: string}
  children: React.ReactNode
}

export function AdminChrome({groups, studioName, user, labels, children}: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Close the drawer after navigating.
  useEffect(() => setOpen(false), [pathname])

  async function signOut() {
    await fetch('/api/admin/session', {method: 'DELETE'})
    router.replace('/admin/login')
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))

  const nav = (
    <nav aria-label={labels.dashboard} className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 px-3 text-xs font-bold uppercase tracking-wide text-ink-soft/70">{group.title}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] ?? LayoutDashboard
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-semibold transition-colors',
                      active ? 'bg-brand text-brand-ink' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
                    )}
                  >
                    <Icon aria-hidden className="size-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  const brand = (
    <Link href="/admin" className="flex min-w-0 items-center gap-2.5 text-lg font-extrabold">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-ink">
        <Clapperboard aria-hidden className="size-5" />
      </span>
      <span className="truncate">{studioName}</span>
    </Link>
  )

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">{brand}</div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label={labels.closeMenu} className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 flex w-[min(20rem,85vw)] flex-col border-e border-line bg-surface">
            <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-4">
              {brand}
              <button type="button" aria-label={labels.closeMenu} onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-lg border border-line">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur sm:px-8">
          <button
            type="button"
            aria-label={labels.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-lg border border-line lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-bold hover:border-brand hover:text-brand sm:inline-flex"
            >
              <ExternalLink aria-hidden className="size-4" />
              {labels.viewSite}
            </Link>
            <LanguageSwitcher label={labels.switchLanguage} />
            <div className="hidden text-end leading-tight md:block">
              <p className="max-w-48 truncate text-sm font-bold" dir="ltr">
                {user.email}
              </p>
              <p className="text-xs text-brand">{user.roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label={labels.signOut}
              title={labels.signOut}
              className="grid size-11 place-items-center rounded-lg border border-line hover:border-red-400 hover:text-red-400"
            >
              <LogOut aria-hidden className="size-5" />
            </button>
          </div>
        </header>
        <main id="main" className="px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
