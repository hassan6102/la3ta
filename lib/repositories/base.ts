import 'server-only'
import {FieldValue, Timestamp, type DocumentSnapshot} from 'firebase-admin/firestore'
import {adminDb} from '@/lib/firebase/admin'

export const C = {
  settings: 'settings',
  categories: 'serviceCategories',
  services: 'services',
  packages: 'packages',
  options: 'pricingOptions',
  builderConfig: 'builderConfig',
  discounts: 'discounts',
  coupons: 'coupons',
  portfolio: 'portfolio',
  reviews: 'reviews',
  orders: 'orders',
  users: 'users',
  audit: 'auditLog',
  meta: 'meta',
} as const

export type Actor = {uid: string; email: string | null; role: string}

/** Firestore Timestamps become ISO strings so documents are plain, serializable objects. */
function convert(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(convert)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, convert(v)]))
  }
  return value
}

export function snapToObject<T>(snap: DocumentSnapshot): (T & {id: string}) | null {
  if (!snap.exists) return null
  return {...(convert(snap.data()) as T), id: snap.id}
}

export async function listCollection<T>(name: string): Promise<(T & {id: string})[]> {
  const snap = await adminDb().collection(name).get()
  return snap.docs.map((d) => ({...(convert(d.data()) as T), id: d.id}))
}

export async function getDocument<T>(name: string, id: string): Promise<(T & {id: string}) | null> {
  return snapToObject<T>(await adminDb().collection(name).doc(id).get())
}

export const serverTime = () => FieldValue.serverTimestamp()

export function byOrder<T extends {order: number}>(a: T, b: T): number {
  return a.order - b.order
}

/** Any pricing-related write bumps this counter so clients can tell their estimate is stale. */
export async function bumpPricingRevision(): Promise<void> {
  await adminDb().collection(C.meta).doc('pricing').set({revision: FieldValue.increment(1), updatedAt: serverTime()}, {merge: true})
}

export async function getPricingRevision(): Promise<number> {
  const snap = await adminDb().collection(C.meta).doc('pricing').get()
  const revision: unknown = snap.data()?.revision
  return typeof revision === 'number' ? revision : 0
}

/** Audit trail. Never blocks the write it describes. */
export async function audit(actor: Actor, action: string, collection: string, docId: string): Promise<void> {
  try {
    await adminDb().collection(C.audit).add({
      actorUid: actor.uid,
      actorEmail: actor.email,
      actorRole: actor.role,
      action,
      collection,
      docId,
      at: serverTime(),
    })
  } catch (error) {
    console.error('audit log write failed', error)
  }
}

/** Reorders a collection by swapping a document with its neighbour, then re-numbering 1..n. */
export async function moveInOrder(name: string, id: string, direction: 'up' | 'down', scope?: (doc: {id: string} & Record<string, unknown>) => boolean): Promise<boolean> {
  const all = (await listCollection<{order: number} & Record<string, unknown>>(name)).filter((d) => (scope ? scope(d) : true)).sort(byOrder)
  const index = all.findIndex((d) => d.id === id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= all.length) return false
  ;[all[index], all[target]] = [all[target], all[index]]
  const batch = adminDb().batch()
  all.forEach((d, i) => batch.update(adminDb().collection(name).doc(d.id), {order: i + 1}))
  await batch.commit()
  return true
}

export async function nextOrder(name: string): Promise<number> {
  const all = await listCollection<{order?: number}>(name)
  return all.reduce((max, d) => Math.max(max, typeof d.order === 'number' ? d.order : 0), 0) + 1
}
