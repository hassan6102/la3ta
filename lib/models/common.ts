import {z} from 'zod'

export type Localized = {ar: string; en: string}
export type DocMeta = {id: string; createdAt?: string; updatedAt?: string}

/** Arabic is required (primary language); English is optional and falls back to Arabic on the site. */
export const localizedRequired = (max = 200) =>
  z.object({ar: z.string().trim().min(1).max(max), en: z.string().trim().max(max)})

export const localizedOptional = (max = 1000) =>
  z.object({ar: z.string().trim().max(max), en: z.string().trim().max(max)})

/** Integer piasters, capped at 1,000,000 EGP to catch typos. */
export const piastersSchema = z.number().int().min(0).max(100000000)

export const optionalUrl = z.union([z.literal(''), z.string().trim().url().max(500)])

export const PRICING_UNITS = ['per_lecture', 'per_hour', 'per_video', 'per_design', 'per_item', 'flat'] as const
