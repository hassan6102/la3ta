import {z} from 'zod'
import type {PricingEffect} from '@/lib/pricing/types'
import {localizedOptional, localizedRequired, piastersSchema, type DocMeta} from './common'

export const effectSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('flat'), amount: piastersSchema}),
  z.object({type: z.literal('per_unit'), amount: piastersSchema, targetServiceIds: z.array(z.string().min(1)).max(60)}),
  z.object({type: z.literal('percent'), percent: z.number().min(0).max(1000), targetServiceIds: z.array(z.string().min(1)).max(60)}),
])

const choiceSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]{1,40}$/),
  label: localizedRequired(80),
  effect: effectSchema,
})

export const optionInputSchema = z
  .object({
    name: localizedRequired(80),
    description: localizedOptional(300),
    type: z.enum(['select', 'toggle']),
    required: z.boolean(),
    active: z.boolean(),
    choices: z.array(choiceSchema).min(1).max(12),
  })
  .refine((o) => new Set(o.choices.map((c) => c.id)).size === o.choices.length, {path: ['choices'], message: 'invalid'})
  .refine((o) => o.type !== 'toggle' || (o.choices.length === 1 && o.choices[0].id === 'on'), {path: ['choices'], message: 'invalid'})

export type OptionInput = z.infer<typeof optionInputSchema>
export type OptionDoc = OptionInput & DocMeta & {order: number}

// Compile-time check that the validated shape is what the pure engine expects.
export type _EffectMatchesEngine = z.infer<typeof effectSchema> extends PricingEffect ? true : never

export const builderConfigSchema = z.object({
  /** Smallest accepted custom package total, piasters (0 = no minimum). */
  minTotal: piastersSchema,
  /** Round totals to the nearest multiple of this many piasters (0 = no rounding). */
  roundTo: piastersSchema,
  notes: localizedOptional(600),
})
export type BuilderConfigInput = z.infer<typeof builderConfigSchema>
export const DEFAULT_BUILDER_CONFIG: BuilderConfigInput = {minTotal: 0, roundTo: 0, notes: {ar: '', en: ''}}

/** Reserved for the Discounts phase. Read by the engine; no admin UI yet. */
export type DiscountDoc = DocMeta & {
  name: {ar: string; en: string}
  type: 'percent' | 'fixed'
  value: number
  minSubtotal: number
  active: boolean
}
