import {z} from 'zod'
import {localizedOptional, localizedRequired, PRICING_UNITS, piastersSchema, type DocMeta} from './common'

export const categoryInputSchema = z.object({
  name: localizedRequired(80),
  description: localizedOptional(300),
  active: z.boolean(),
})
export type CategoryInput = z.infer<typeof categoryInputSchema>
export type CategoryDoc = CategoryInput & DocMeta & {order: number}

const servicePricingSchema = z.object({
  unit: z.enum(PRICING_UNITS),
  /** Integer piasters. null = the studio has not set a price yet (shown as "ask us"). */
  unitPrice: piastersSchema.nullable(),
  /** Whether the price is shown on the public Services page. */
  showPrice: z.boolean(),
})

const serviceBuilderSchema = z
  .object({
    enabled: z.boolean(),
    minQty: z.number().int().min(1).max(10000),
    maxQty: z.number().int().min(1).max(10000),
    step: z.number().int().min(1).max(10000),
    defaultQty: z.number().int().min(1).max(10000),
  })
  .refine((b) => b.minQty <= b.maxQty, {path: ['maxQty'], message: 'invalid'})
  .refine((b) => b.defaultQty >= b.minQty && b.defaultQty <= b.maxQty, {path: ['defaultQty'], message: 'invalid'})

export const serviceInputSchema = z
  .object({
    categoryId: z.string().min(1).max(100),
    name: localizedRequired(120),
    description: localizedOptional(500),
    active: z.boolean(),
    pricing: servicePricingSchema,
    builder: serviceBuilderSchema,
  })
  .refine((s) => !s.builder.enabled || s.pricing.unitPrice !== null, {path: ['pricing', 'unitPrice'], message: 'required'})

export type ServiceInput = z.infer<typeof serviceInputSchema>
export type ServiceDoc = ServiceInput & DocMeta & {order: number; imageUrl?: string; imagePath?: string}

export const DEFAULT_SERVICE_PRICING: ServiceInput['pricing'] = {unit: 'per_item', unitPrice: null, showPrice: false}
export const DEFAULT_SERVICE_BUILDER: ServiceInput['builder'] = {enabled: false, minQty: 1, maxQty: 100, step: 1, defaultQty: 1}
