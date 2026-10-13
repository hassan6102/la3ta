'use server'

import {bool, jsonField, localized, str} from '@/lib/admin/form'
import {done, failed, guarded, InvalidInput, parseInput, revalidatePublicSite, type ActionState} from '@/lib/admin/action'
import {can} from '@/lib/auth/roles'
import {packageInputSchema} from '@/lib/models/packages'
import {parseEgpToPiasters} from '@/lib/money'
import {listServices} from '@/lib/repositories/catalog'
import {deletePackage, getPackage, movePackage, savePackage, setPackageFlag} from '@/lib/repositories/packages'

const lines = (text: string) => text.split(/\r?\n/).map((l) => l.trim())

export async function savePackageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    const id = str(formData, 'id') || null
    const canPrice = can(session.role, 'pricing:write')
    // A package carries a price, so creating one needs the pricing permission. Editors may edit content.
    if (!id && !canPrice) return failed('forbidden')
    const existing = id ? await getPackage(id) : null
    if (id && !existing) return failed('not_found')

    let price = existing?.price ?? 0
    let originalPrice = existing?.originalPrice ?? null
    if (canPrice) {
      const parsedPrice = parseEgpToPiasters(str(formData, 'price'))
      if (parsedPrice === null) throw new InvalidInput({price: 'invalid'})
      price = parsedPrice
      const originalText = str(formData, 'originalPrice')
      originalPrice = originalText === '' ? null : parseEgpToPiasters(originalText)
      if (originalText !== '' && originalPrice === null) throw new InvalidInput({originalPrice: 'invalid'})
    }

    const rawIncludes = jsonField<{serviceId?: unknown; quantity?: unknown}[]>(formData, 'includes', [])
    const featuresAr = lines(str(formData, 'featuresAr')).filter(Boolean)
    const featuresEn = lines(str(formData, 'featuresEn'))

    const input = parseInput(packageInputSchema, {
      name: localized(formData, 'name'),
      description: localized(formData, 'description'),
      includes: Array.isArray(rawIncludes) ? rawIncludes.map((i) => ({serviceId: String(i.serviceId ?? ''), quantity: Number(i.quantity)})) : [],
      features: featuresAr.map((ar, index) => ({ar, en: featuresEn[index] ?? ''})),
      price,
      originalPrice,
      badge: localized(formData, 'badge'),
      featured: bool(formData, 'featured'),
      active: bool(formData, 'active'),
      imageUrl: str(formData, 'imageUrl'),
      imagePath: existing?.imagePath ?? '',
    })

    // Every included service must exist.
    const known = new Set((await listServices()).map((s) => s.id))
    if (input.includes.some((i) => !known.has(i.serviceId))) throw new InvalidInput({includes: 'invalid'})

    const result = await savePackage(id, input, canPrice, session)
    if (!result.ok) return failed(result.code)
    revalidatePublicSite()
    return done('saved', result.id)
  })
}

export async function deletePackageAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    await deletePackage(str(formData, 'id'), session)
    revalidatePublicSite()
    return done('deleted')
  })
}

export async function movePackageAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async () => {
    await movePackage(str(formData, 'id'), str(formData, 'direction') === 'up' ? 'up' : 'down')
    revalidatePublicSite()
    return done('updated')
  })
}

export async function togglePackageAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    const flag = str(formData, 'flag') === 'featured' ? 'featured' : 'active'
    await setPackageFlag(str(formData, 'id'), flag, str(formData, 'value') === 'true', session)
    revalidatePublicSite()
    return done('updated')
  })
}
