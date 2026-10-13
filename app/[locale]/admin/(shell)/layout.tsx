import {getTranslations, setRequestLocale} from 'next-intl/server'
import {AdminChrome} from '@/components/admin/admin-chrome'
import {ADMIN_NAV} from '@/lib/admin/nav'
import {requirePageSession} from '@/lib/auth/requireRole'
import {can} from '@/lib/auth/roles'
import {getSiteSettings} from '@/lib/data'
import {localize} from '@/lib/localize'

export default async function AdminShellLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params
  setRequestLocale(locale)
  // Verified on the server for every request: signature, expiry, revocation, role claim.
  const session = await requirePageSession(locale)
  const [nav, roles, settings] = await Promise.all([getTranslations('admin.nav'), getTranslations('admin.users.roles'), getSiteSettings()])

  const groups = ADMIN_NAV.map((group) => ({
    title: nav(group.group),
    items: group.items.filter((item) => !item.permission || can(session.role, item.permission)).map((item) => ({href: item.href, label: nav(item.key), icon: item.icon})),
  })).filter((group) => group.items.length > 0)

  return (
    <AdminChrome
      groups={groups}
      studioName={localize(settings.studioName, locale)}
      user={{email: session.email ?? '', roleLabel: roles(session.role)}}
      labels={{
        openMenu: nav('openMenu'),
        closeMenu: nav('closeMenu'),
        viewSite: nav('viewSite'),
        signOut: (await getTranslations('admin.common'))('signOut'),
        switchLanguage: (await getTranslations('common'))('switchLanguage'),
        dashboard: nav('title'),
      }}
    >
      {children}
    </AdminChrome>
  )
}
