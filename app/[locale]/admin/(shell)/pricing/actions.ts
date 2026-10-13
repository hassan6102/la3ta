'use server'

import {bool, jsonField, localized, str} from '@/lib/admin/form'
import {done, failed, guarded, InvalidInput, parseInput, revalidatePublicSite, type ActionState} from '@/lib/admin/action'
import {builderConfigSchema, optionInputSchema} from '@/lib/models/pricing'
import {parseEgpToPiasters} from '@/lib/money'
import {deleteOption, moveOption, saveBuilderConfig, saveOption, setOptionActive} from '@/lib/repositories/pricing'

/** Admin types EGP ("5" or "2.5"); an empty box means 0. Returns piasters, or throws a field error. */
function egpOrZero(text: string, field: string): number {
  if (text.trim() === '') return 0
  const value = parseEgpToPiasters(text)
  if (value === null) throw new InvalidInput({[field]: 'invalid'})
  return value
}

export async function saveBuilderConfigAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('pricing:write', async (session) => {
    const input = parseInput(builderConfigSchema, {
      minTotal: egpOrZero(str(formData, 'minTotal'), 'minTotal'),
      roundTo: egpOrZero(str(formData, 'roundTo'), 'roundTo'),
      notes: localized(formData, 'notes'),
    })
    await saveBuilderConfig(input, session)
    revalidatePublicSite()
    return done('saved')
  })
}

type RawChoice = {id?: unknown; labelAr?: unknown; labelEn?: unknown; effectType?: unknown; amount?: unknown; percent?: unknown; targets?: unknown}

export async function saveOptionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('pricing:write', async (session) => {
    const id = str(formData, 'id') || null
    const raw = jsonField<RawChoice[]>(formData, 'choices', [])
    if (!Array.isArray(raw)) throw new InvalidInput({choices: 'invalid'})

    const choices = raw.map((c, index) => {
      const targets = Array.isArray(c.targets) ? c.targets.map(String) : []
      const field = `choices.${index}`
      let effect
      switch (c.effectType) {
        case 'per_unit':
          effect = {type: 'per_unit' as const, amount: egpOrZero(String(c.amount ?? ''), `${field}.effect`), targetServiceIds: targets}
          break
        case 'percent':
          effect = {type: 'percent' as const, percent: Number(String(c.percent ?? '0') || 0), targetServiceIds: targets}
          break
        default:
          effect = {type: 'flat' as const, amount: egpOrZero(String(c.amount ?? ''), `${field}.effect`)}
      }
      return {id: String(c.id ?? ''), label: {ar: String(c.labelAr ?? '').trim(), en: String(c.labelEn ?? '').trim()}, effect}
    })

    const input = parseInput(optionInputSchema, {
      name: localized(formData, 'name'),
      description: localized(formData, 'description'),
      type: str(formData, 'type'),
      required: bool(formData, 'required'),
      active: bool(formData, 'active'),
      choices,
    })
    const result = await saveOption(id, input, session)
    if (!result.ok) return failed(result.code)
    revalidatePublicSite()
    return done('saved', result.id)
  })
}

export async function deleteOptionAction(formData: FormData): Promise<ActionState> {
  return guarded('pricing:write', async (session) => {
    await deleteOption(str(formData, 'id'), session)
    revalidatePublicSite()
    return done('deleted')
  })
}

export async function moveOptionAction(formData: FormData): Promise<ActionState> {
  return guarded('pricing:write', async () => {
    await moveOption(str(formData, 'id'), str(formData, 'direction') === 'up' ? 'up' : 'down')
    revalidatePublicSite()
    return done('updated')
  })
}

export async function toggleOptionAction(formData: FormData): Promise<ActionState> {
  return guarded('pricing:write', async (session) => {
    await setOptionActive(str(formData, 'id'), str(formData, 'active') === 'true', session)
    revalidatePublicSite()
    return done('updated')
  })
}
