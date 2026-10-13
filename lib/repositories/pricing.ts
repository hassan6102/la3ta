import 'server-only'
import {adminDb} from '@/lib/firebase/admin'
import {DEFAULT_BUILDER_CONFIG, type BuilderConfigInput, type DiscountDoc, type OptionDoc, type OptionInput} from '@/lib/models/pricing'
import type {PricingConfig} from '@/lib/pricing/types'
import {audit, bumpPricingRevision, byOrder, C, getDocument, getPricingRevision, listCollection, moveInOrder, nextOrder, serverTime, snapToObject, type Actor} from './base'
import type {RepoResult} from './catalog'
import {listServices} from './catalog'
import {readSiteSettings} from './settings'

// ── builder config ───────────────────────────────────────────────────────────
export async function getBuilderConfig(): Promise<BuilderConfigInput> {
  const snap = await adminDb().collection(C.builderConfig).doc('main').get()
  const stored = snapToObject<Partial<BuilderConfigInput>>(snap)
  return {...DEFAULT_BUILDER_CONFIG, ...stored, notes: {...DEFAULT_BUILDER_CONFIG.notes, ...stored?.notes}}
}

export async function saveBuilderConfig(input: BuilderConfigInput, actor: Actor): Promise<void> {
  await adminDb().collection(C.builderConfig).doc('main').set({...input, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
  await audit(actor, 'update', C.builderConfig, 'main')
  await bumpPricingRevision()
}

// ── option groups and add-ons ────────────────────────────────────────────────
export async function listOptions(): Promise<OptionDoc[]> {
  return (await listCollection<OptionDoc>(C.options)).sort(byOrder)
}

export async function getOption(id: string): Promise<OptionDoc | null> {
  return getDocument<OptionDoc>(C.options, id)
}

export async function saveOption(id: string | null, input: OptionInput, actor: Actor): Promise<RepoResult> {
  const col = adminDb().collection(C.options)
  if (id) {
    const ref = col.doc(id)
    if (!(await ref.get()).exists) return {ok: false, code: 'not_found'}
    // set (no merge): the choices array must be replaced exactly, including removed choices.
    const existing = (await ref.get()).data()
    await ref.set({...input, order: existing?.order ?? (await nextOrder(C.options)), createdAt: existing?.createdAt ?? serverTime(), updatedAt: serverTime(), updatedBy: actor.uid})
    await audit(actor, 'update', C.options, id)
  } else {
    const ref = col.doc()
    id = ref.id
    await ref.set({...input, order: await nextOrder(C.options), createdAt: serverTime(), updatedAt: serverTime(), updatedBy: actor.uid})
    await audit(actor, 'create', C.options, id)
  }
  await bumpPricingRevision()
  return {ok: true, id}
}

export async function deleteOption(id: string, actor: Actor): Promise<void> {
  await adminDb().collection(C.options).doc(id).delete()
  await audit(actor, 'delete', C.options, id)
  await bumpPricingRevision()
}

export const moveOption = (id: string, direction: 'up' | 'down') => moveInOrder(C.options, id, direction)

export async function setOptionActive(id: string, active: boolean, actor: Actor): Promise<void> {
  await adminDb().collection(C.options).doc(id).set({active, updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
  await audit(actor, active ? 'activate' : 'deactivate', C.options, id)
  await bumpPricingRevision()
}

// ── the configuration the pricing engine runs on ─────────────────────────────
/**
 * Public-safe pricing configuration: only active, buildable, priced services and active options.
 * The browser uses it for the live estimate; the server uses the same function to re-price orders.
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  const [services, options, discounts, config, revision, {settings}] = await Promise.all([
    listServices(),
    listOptions(),
    listCollection<DiscountDoc>(C.discounts),
    getBuilderConfig(),
    getPricingRevision(),
    readSiteSettings(),
  ])

  return {
    currency: settings.defaultCurrency,
    revision,
    minTotal: config.minTotal,
    roundTo: config.roundTo,
    services: services
      .filter((s) => s.active && s.builder.enabled && s.pricing.unitPrice !== null)
      .map((s) => ({
        id: s.id,
        categoryId: s.categoryId,
        name: s.name,
        unit: s.pricing.unit,
        unitPrice: s.pricing.unitPrice,
        active: s.active,
        builderEnabled: s.builder.enabled,
        minQty: s.builder.minQty,
        maxQty: s.builder.maxQty,
        step: s.builder.step,
        defaultQty: s.builder.defaultQty,
      })),
    options: options
      .filter((o) => o.active)
      .map((o) => ({id: o.id, name: o.name, type: o.type, required: o.required, active: o.active, choices: o.choices})),
    discounts: discounts.map((d) => ({id: d.id, name: d.name, type: d.type, value: d.value, minSubtotal: d.minSubtotal, active: d.active})),
  }
}
