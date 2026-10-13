/** Text that exists in both supported languages. Mirrors the *_ar / *_en fields planned for Firestore. */
export type LocalizedText = {ar: string; en: string}

/** EGP is the default; kept as a plain string so other currencies can be added later without code changes. */
export type CurrencyCode = string
export const DEFAULT_CURRENCY: CurrencyCode = 'EGP'

export type Money = {amount: number; currency: CurrencyCode}

/** How a service is priced. The builder (Phase 3) will compute quantity × unitPrice from Firestore values. */
export type PricingUnit = 'per_lecture' | 'per_hour' | 'per_video' | 'per_design' | 'per_item' | 'flat'

export type ServiceItem = {
  id: string
  name: LocalizedText
  unit?: PricingUnit
  unitPrice?: Money
}

export type ServiceCategory = {
  id: string
  name: LocalizedText
  description: LocalizedText
  items: ServiceItem[]
  order: number
  active: boolean
}

export type StudioPackage = {
  id: string
  name: LocalizedText
  description: LocalizedText
  price: Money
  discountedPrice?: Money
  features: LocalizedText[]
  /** Quantity of each included service, resolved against the services collection. */
  includes?: {serviceId: string; quantity: number}[]
  badge?: LocalizedText
  imageUrl?: string
  featured: boolean
  active: boolean
  order: number
}

export type PortfolioItem = {
  id: string
  category: string
  title: LocalizedText
  imageUrl: string
  videoUrl?: string
  active: boolean
  order: number
}

export type SiteSettings = {
  studioName: LocalizedText
  location: LocalizedText
  /** International format without "+", e.g. 20XXXXXXXXXX. */
  whatsappNumber: string
  whatsappIsPlaceholder: boolean
  phone?: string
  email?: string
  socialLinks?: {facebook?: string; instagram?: string; youtube?: string; tiktok?: string}
  defaultCurrency: CurrencyCode
  /** When false, /build-package shows the "not available yet" state even if pricing exists. */
  builderEnabled: boolean
}
