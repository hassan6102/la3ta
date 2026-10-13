/**
 * Roles live in Firebase Auth custom claims (`role`), set only by the Admin SDK.
 * No Firestore field decides who is an admin.
 */
export const ROLES = ['super_admin', 'admin', 'editor'] as const
export type Role = (typeof ROLES)[number]

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

export const PERMISSIONS = [
  'content:write', // services, categories, package text, portfolio, reviews, files
  'pricing:write', // prices, builder pricing, package prices
  'discounts:write', // discounts and coupons
  'orders:manage',
  'settings:write',
  'users:manage', // roles
  'audit:read',
] as const
export type Permission = (typeof PERMISSIONS)[number]

const ALL = [...PERMISSIONS] as Permission[]

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: ALL,
  admin: ALL.filter((p) => p !== 'users:manage' && p !== 'audit:read'),
  editor: ['content:write'],
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
