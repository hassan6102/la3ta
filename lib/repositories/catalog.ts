import 'server-only'
import {DEFAULT_SERVICE_CATEGORIES} from '@/lib/data/defaults'
import {adminDb} from '@/lib/firebase/admin'
import {
  DEFAULT_SERVICE_BUILDER,
  DEFAULT_SERVICE_PRICING,
  type CategoryDoc,
  type CategoryInput,
  type ServiceDoc,
  type ServiceInput,
} from '@/lib/models/catalog'
import {audit, bumpPricingRevision, byOrder, C, getDocument, listCollection, moveInOrder, nextOrder, serverTime, type Actor} from './base'

export type RepoResult = {ok: true; id: string} | {ok: false; code: 'not_found' | 'in_use'}

// ── categories ───────────────────────────────────────────────────────────────
export async function listCategories(): Promise<CategoryDoc[]> {
  return (await listCollection<CategoryDoc>(C.categories)).sort(byOrder)
}

export async function getCategory(id: string): Promise<CategoryDoc | null> {
  return getDocument<CategoryDoc>(C.categories, id)
}

export async function saveCategory(id: string | null, input: CategoryInput, actor: Actor): Promise<RepoResult> {
  const col = adminDb().collection(C.categories)
  if (id) {
    const ref = col.doc(id)
    if (!(await ref.get()).exists) return {ok: false, code: 'not_found'}
    await ref.set({...input, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
    await audit(actor, 'update', C.categories, id)
    return {ok: true, id}
  }
  const ref = col.doc()
  await ref.set({...input, order: await nextOrder(C.categories), createdAt: serverTime(), updatedAt: serverTime(), updatedBy: actor.uid})
  await audit(actor, 'create', C.categories, ref.id)
  return {ok: true, id: ref.id}
}

export async function deleteCategory(id: string, actor: Actor): Promise<RepoResult> {
  const services = await listServices()
  if (services.some((s) => s.categoryId === id)) return {ok: false, code: 'in_use'}
  await adminDb().collection(C.categories).doc(id).delete()
  await audit(actor, 'delete', C.categories, id)
  return {ok: true, id}
}

export const moveCategory = (id: string, direction: 'up' | 'down') => moveInOrder(C.categories, id, direction)

export async function setCategoryActive(id: string, active: boolean, actor: Actor): Promise<void> {
  await adminDb().collection(C.categories).doc(id).set({active, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
  await audit(actor, active ? 'activate' : 'deactivate', C.categories, id)
}

// ── services ─────────────────────────────────────────────────────────────────
export async function listServices(): Promise<ServiceDoc[]> {
  return (await listCollection<ServiceDoc>(C.services)).sort(byOrder)
}

export async function getService(id: string): Promise<ServiceDoc | null> {
  return getDocument<ServiceDoc>(C.services, id)
}

/**
 * `input.pricing` / `input.builder` are only written when the caller may change prices
 * (the action passes `canWritePricing`). Editors keep the stored values.
 */
export async function saveService(id: string | null, input: ServiceInput, canWritePricing: boolean, actor: Actor): Promise<RepoResult> {
  const col = adminDb().collection(C.services)
  const {pricing, builder, ...content} = input
  const pricingPart = canWritePricing ? {pricing, builder} : {}

  if (id) {
    const ref = col.doc(id)
    if (!(await ref.get()).exists) return {ok: false, code: 'not_found'}
    await ref.set({...content, ...pricingPart, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
    await audit(actor, 'update', C.services, id)
  } else {
    const ref = col.doc()
    id = ref.id
    await ref.set({
      ...content,
      pricing: canWritePricing ? pricing : DEFAULT_SERVICE_PRICING,
      builder: canWritePricing ? builder : DEFAULT_SERVICE_BUILDER,
      order: await nextOrder(C.services),
      createdAt: serverTime(),
      updatedAt: serverTime(),
      updatedBy: actor.uid,
    })
    await audit(actor, 'create', C.services, id)
  }
  await bumpPricingRevision()
  return {ok: true, id}
}

export async function deleteService(id: string, actor: Actor): Promise<RepoResult> {
  const packages = await listCollection<{includes?: {serviceId: string}[]}>(C.packages)
  if (packages.some((p) => p.includes?.some((i) => i.serviceId === id))) return {ok: false, code: 'in_use'}
  await adminDb().collection(C.services).doc(id).delete()
  await audit(actor, 'delete', C.services, id)
  await bumpPricingRevision()
  return {ok: true, id}
}

export async function moveService(id: string, direction: 'up' | 'down'): Promise<boolean> {
  const service = await getService(id)
  if (!service) return false
  // Reorder within the category only, so arrows behave the way the list looks.
  return moveInOrder(C.services, id, direction, (d) => d.categoryId === service.categoryId)
}

export async function setServiceActive(id: string, active: boolean, actor: Actor): Promise<void> {
  await adminDb().collection(C.services).doc(id).set({active, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
  await audit(actor, active ? 'activate' : 'deactivate', C.services, id)
  await bumpPricingRevision()
}

// ── one-time import of the Phase 1 catalog (names only, never prices) ─────────
export async function seedCatalog(actor: Actor): Promise<{categories: number; services: number}> {
  const db = adminDb()
  const categoryRefs = DEFAULT_SERVICE_CATEGORIES.map((c) => db.collection(C.categories).doc(c.id))
  const serviceEntries = DEFAULT_SERVICE_CATEGORIES.flatMap((c) => c.items.map((item, index) => ({category: c, item, index})))
  const serviceRefs = serviceEntries.map(({item}) => db.collection(C.services).doc(item.id))

  const [categorySnaps, serviceSnaps] = await Promise.all([db.getAll(...categoryRefs), db.getAll(...serviceRefs)])
  const batch = db.batch()
  let categories = 0
  let services = 0

  DEFAULT_SERVICE_CATEGORIES.forEach((c, i) => {
    if (categorySnaps[i].exists) return
    batch.set(categoryRefs[i], {
      name: c.name,
      description: c.description,
      active: c.active,
      order: c.order,
      createdAt: serverTime(),
      updatedAt: serverTime(),
      updatedBy: actor.uid,
    })
    categories++
  })

  // Service order is global so list sorting stays simple: category order first, then position.
  serviceEntries.forEach(({category, item, index}, i) => {
    if (serviceSnaps[i].exists) return
    batch.set(serviceRefs[i], {
      categoryId: category.id,
      name: item.name,
      description: {ar: '', en: ''},
      active: true,
      order: category.order * 100 + index + 1,
      pricing: DEFAULT_SERVICE_PRICING,
      builder: DEFAULT_SERVICE_BUILDER,
      createdAt: serverTime(),
      updatedAt: serverTime(),
      updatedBy: actor.uid,
    })
    services++
  })

  if (categories + services > 0) {
    await batch.commit()
    await audit(actor, 'seed', C.services, `${categories}c/${services}s`)
    await bumpPricingRevision()
  }
  return {categories, services}
}
