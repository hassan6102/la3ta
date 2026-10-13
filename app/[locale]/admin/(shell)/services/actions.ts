'use server'

import {bool, int, localized, str} from '@/lib/admin/form'
import {done, failed, guarded, InvalidInput, parseInput, revalidatePublicSite, type ActionState} from '@/lib/admin/action'
import {can} from '@/lib/auth/roles'
import {DEFAULT_SERVICE_BUILDER, DEFAULT_SERVICE_PRICING, serviceInputSchema} from '@/lib/models/catalog'
import {parseEgpToPiasters} from '@/lib/money'
import {deleteService, getCategory, getService, moveService, saveService, seedCatalog, setServiceActive} from '@/lib/repositories/catalog'

export async function saveServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    const id = str(formData, 'id') || null
    const canPrice = can(session.role, 'pricing:write')
    const existing = id ? await getService(id) : null
    if (id && !existing) return failed('not_found')

    const priceText = str(formData, 'unitPrice')
    const unitPrice = priceText === '' ? null : parseEgpToPiasters(priceText)
    if (priceText !== '' && unitPrice === null) throw new InvalidInput({'pricing.unitPrice': 'invalid'})

    // Editors never change money-related fields: stored values are kept.
    const pricing = canPrice
      ? {unit: str(formData, 'unit'), unitPrice, showPrice: bool(formData, 'showPrice')}
      : (existing?.pricing ?? DEFAULT_SERVICE_PRICING)
    const builder = canPrice
      ? {
          enabled: bool(formData, 'builderEnabled'),
          minQty: int(formData, 'minQty', 1),
          maxQty: int(formData, 'maxQty', 100),
          step: int(formData, 'step', 1),
          defaultQty: int(formData, 'defaultQty', 1),
        }
      : (existing?.builder ?? DEFAULT_SERVICE_BUILDER)

    const input = parseInput(serviceInputSchema, {
      categoryId: str(formData, 'categoryId'),
      name: localized(formData, 'name'),
      description: localized(formData, 'description'),
      active: bool(formData, 'active'),
      pricing,
      builder,
    })
    if (!(await getCategory(input.categoryId))) throw new InvalidInput({categoryId: 'invalid'})

    const result = await saveService(id, input, canPrice, session)
    if (!result.ok) return failed(result.code)
    revalidatePublicSite()
    return done('saved', result.id)
  })
}

export async function deleteServiceAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    const result = await deleteService(str(formData, 'id'), session)
    if (!result.ok) return failed(result.code)
    revalidatePublicSite()
    return done('deleted')
  })
}

export async function moveServiceAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async () => {
    await moveService(str(formData, 'id'), str(formData, 'direction') === 'up' ? 'up' : 'down')
    revalidatePublicSite()
    return done('updated')
  })
}

export async function toggleServiceAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    await setServiceActive(str(formData, 'id'), str(formData, 'active') === 'true', session)
    revalidatePublicSite()
    return done('updated')
  })
}

/** One-time import of the Phase 1 categories and service names. Names only, never prices. Safe to repeat. */
export async function seedCatalogAction(formData: FormData): Promise<ActionState> {
  void formData
  return guarded('content:write', async (session) => {
    await seedCatalog(session)
    revalidatePublicSite()
    return done('seeded')
  })
}
