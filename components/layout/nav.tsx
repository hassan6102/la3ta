'use client'

import {useState} from 'react'
import {Menu, X} from 'lucide-react'
import {Link, usePathname} from '@/i18n/navigation'
import {cn} from '@/lib/utils'

type NavLink = {href: string; label: string}

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
}

export function DesktopNav({links, label}: {links: NavLink[]; label: string}) {
  const isActive = useIsActive()
  return (
    <nav aria-label={label} className="hidden items-center gap-1 lg:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? 'page' : undefined}
          className={cn(
            'rounded-lg px-3 py-2 text-base font-semibold transition-colors hover:text-brand',
            isActive(link.href) ? 'text-brand' : 'text-ink-soft',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

type MobileMenuProps = {
  links: NavLink[]
  label: string
  openLabel: string
  closeLabel: string
  children?: React.ReactNode
}

export function MobileMenu({links, label, openLabel, closeLabel, children}: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const isActive = useIsActive()
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-lg border border-line text-ink"
      >
        {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
      </button>
      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-canvas p-5 shadow-2xl shadow-black/50"
        >
          <nav aria-label={label} className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center border-b border-line/60 text-lg font-bold',
                  isActive(link.href) ? 'text-brand' : 'text-ink',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5">{children}</div>
        </div>
      )}
    </div>
  )
}
