import {z} from 'zod'
import {localizedRequired, optionalUrl, type DocMeta, type Localized} from './common'

export const siteSettingsSchema = z.object({
  studioName: localizedRequired(80),
  location: localizedRequired(200),
  /** International digits without "+", e.g. 20XXXXXXXXXX. Empty until the owner enters the real number. */
  whatsappNumber: z.union([z.literal(''), z.string().regex(/^\d{8,15}$/)]),
  phone: z.string().trim().max(30),
  email: z.union([z.literal(''), z.string().trim().email().max(120)]),
  socialLinks: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
    youtube: optionalUrl,
    tiktok: optionalUrl,
  }),
  defaultCurrency: z.string().regex(/^[A-Z]{3}$/),
  builderEnabled: z.boolean(),
})

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>
export type SiteSettingsDoc = SiteSettingsInput & Partial<DocMeta>
export type {Localized}
