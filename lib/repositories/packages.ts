import 'server-only'
import {adminDb} from '@/lib/firebase/admin'
import type {PackageDoc, PackageInput} from '@/lib/models/packages'
import {audit, byOrder, C, getDocument, listCollection, moveInOrder, nextOrder, serverTime, type Actor} from './base'
import type {RepoResult} from './catalog'

export async function listPackages(): Promise<PackageDoc[]> {
  return (await listCollection<PackageDoc>(C.packages)).sort(byOrder)
}

export async function getPackage(id: string): Promise<PackageDoc | null> {
  return getDocument<PackageDoc>(C.packages, id)
}

/**
 * Price fields (`price`, `originalPrice`) are only written when the caller may change prices.
 * Editors can update text, includes and visibility but never the money.
 */
export async function savePackage(id: string | null, input: PackageInput, canWritePricing: boolean, actor: Actor): Promise<RepoResult> {
  const col = adminDb().collection(C.packages)
  const {price, originalPrice, ...rest} = input
  const pricePart = canWritePricing ? {price, originalPrice} : {}

  if (id) {
    const ref = col.doc(id)
    if (!(await ref.get()).exists) return {ok: false, code: 'not_found'}
    await ref.set({...rest, ...pricePart, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
    await audit(actor, 'update', C.packages, id)
    return {ok: true, id}
  }
  const ref = col.doc()
  await ref.set({
    ...rest,
    // Only reached with canWritePricing = true: the action refuses to create packages otherwise.
    price,
    originalPrice,
    order: await nextOrder(C.packages),
    createdAt: serverTime(),
    updatedAt: serverTime(),
    updatedBy: actor.uid,
  })
  await audit(actor, 'create', C.packages, ref.id)
  return {ok: true, id: ref.id}
}

export async function deletePackage(id: string, actor: Actor): Promise<void> {
  await adminDb().collection(C.packages).doc(id).delete()
  await audit(actor, 'delete', C.packages, id)
}

export const movePackage = (id: string, direction: 'up' | 'down') => moveInOrder(C.packages, id, direction)

export async function setPackageFlag(id: string, flag: 'active' | 'featured', value: boolean, actor: Actor): Promise<void> {
  await adminDb().collection(C.packages).doc(id).set({[flag]: value, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
  await audit(actor, `${flag}:${value}`, C.packages, id)
}
