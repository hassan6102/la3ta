import type {Permission} from '@/lib/auth/roles'

export type AdminNavItem = {href: string; key: string; icon: string; permission?: Permission}
export type AdminNavGroup = {group: string; items: AdminNavItem[]}

/** Items the role cannot use are hidden. The server still enforces permissions on every page and action. */
export const ADMIN_NAV: AdminNavGroup[] = [
  {group: 'groupMain', items: [{href: '/admin', key: 'overview', icon: 'dashboard'}]},
  {
    group: 'groupCatalog',
    items: [
      {href: '/admin/services', key: 'services', icon: 'services'},
      {href: '/admin/service-categories', key: 'categories', icon: 'categories'},
      {href: '/admin/packages', key: 'packages', icon: 'packages'},
      {href: '/admin/pricing', key: 'pricing', icon: 'pricing', permission: 'pricing:write'},
      {href: '/admin/discounts', key: 'discounts', icon: 'discounts', permission: 'discounts:write'},
      {href: '/admin/coupons', key: 'coupons', icon: 'coupons', permission: 'discounts:write'},
    ],
  },
  {group: 'groupSales', items: [{href: '/admin/orders', key: 'orders', icon: 'orders', permission: 'orders:manage'}]},
  {
    group: 'groupContent',
    items: [
      {href: '/admin/portfolio', key: 'portfolio', icon: 'portfolio'},
      {href: '/admin/reviews', key: 'reviews', icon: 'reviews'},
      {href: '/admin/files', key: 'files', icon: 'files'},
    ],
  },
  {
    group: 'groupSystem',
    items: [
      {href: '/admin/settings', key: 'settings', icon: 'settings', permission: 'settings:write'},
      {href: '/admin/users', key: 'users', icon: 'users', permission: 'users:manage'},
    ],
  },
]
