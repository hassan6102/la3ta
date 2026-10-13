import {z} from 'zod'
import {localizedOptional, localizedRequired, optionalUrl, piastersSchema, type DocMeta} from './common'

export const packageInputSchema = z
  .object({
    name: localizedRequired(100),
    description: localizedOptional(600),
    includes: z
      .array(z.object({serviceId: z.string().min(1).max(100), quantity: z.number().int().min(1).max(10000)}))
      .max(40),
    /** Optional marketing bullets. When empty, the site lists the included services instead. */
    features: z.array(z.object({ar: z.string().trim().min(1).max(200), en: z.string().trim().max(200)})).max(30),
    /** What the customer pays, in piasters. */
    price: piastersSchema,
    /** Optional "before" price shown struck through. Must be higher than `price`. */
    originalPrice: piastersSchema.nullable(),
    badge: localizedOptional(40),
    featured: z.boolean(),
    active: z.boolean(),
    imageUrl: optionalUrl,
    imagePath: z.string().trim().max(300),
  })
  .refine((p) => p.originalPrice === null || p.originalPrice > p.price, {path: ['originalPrice'], message: 'invalid'})

export type PackageInput = z.infer<typeof packageInputSchema>
export type PackageDoc = PackageInput & DocMeta & {order: number}
