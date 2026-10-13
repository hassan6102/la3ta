import {cache} from 'react'
import {isAdminConfigured} from '@/lib/firebase/admin'
import type {PricingConfig} from '@/lib/pricing/types'
import type {PortfolioItem, ServiceCategory, ServiceItem, SiteSettings, StudioPackage} from '@/lib/types'
import {DEFAULT_SERVICE_CATEGORIES, DEFAULT_SETTINGS} from './defaults'

/**
 * Single access point for public business data (pages and components never talk to Firestore).
 * - Firebase Admin configured: reads Firestore on the server, returning public fields only.
 * - Not configured, or a read fails: falls back to the Phase 1 defaults so the site never breaks.
 * Money is stored as integer piasters and converted to currency units here for display.
 */

async function withFallback<T>(read: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!isAdminConfigured()) return fallback
  try {
    return await read()
  } catch (error) {
    console.error(`[data] ${label} failed, using fallback`, error)
    return fallback
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> =>
  withFallback(
    async () => {
      const {readSiteSettings} = await import('@/lib/repositories/settings')
      const {settings} = await readSiteSettings()
      const hasNumber = settings.whatsappNumber !== ''
      return {
        studioName: settings.studioName,
        location: settings.location,
        // Until the owner enters the real number, keep the clearly fake placeholder from Phase 1.
        whatsappNumber: hasNumber ? settings.whatsappNumber : DEFAULT_SETTINGS.whatsappNumber,
        whatsappIsPlaceholder: !hasNumber,
        phone: settings.phone || undefined,
        email: settings.email || undefined,
        socialLinks: settings.socialLinks,
        defaultCurrency: settings.defaultCurrency,
        builderEnabled: settings.builderEnabled,
      }
    },
    DEFAULT_SETTINGS,
    'settings',
  ),
)

export const getServiceCategories = cache(async (): Promise<ServiceCategory[]> =>
  withFallback(
    async () => {
      const [{listCategories, listServices}, settings] = await Promise.all([import('@/lib/repositories/catalog'), getSiteSettings()])
      const [categories, services] = await Promise.all([listCategories(), listServices()])
      return categories
        .filter((c) => c.active)
        .map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          order: c.order,
          active: c.active,
          items: services
            .filter((s) => s.active && s.categoryId === c.id)
            .map((s): ServiceItem => ({
              id: s.id,
              name: s.name,
              unit: s.pricing.unit,
              unitPrice:
                s.pricing.showPrice && s.pricing.unitPrice !== null
                  ? {amount: s.pricing.unitPrice / 100, currency: settings.defaultCurrency}
                  : undefined,
            })),
        }))
    },
    DEFAULT_SERVICE_CATEGORIES.filter((c) => c.active).sort((a, b) => a.order - b.order),
    'service categories',
  ),
)

export const getPackages = cache(async (): Promise<StudioPackage[]> =>
  withFallback(
    async () => {
      const [{listPackages}, {listServices}, settings] = await Promise.all([
        import('@/lib/repositories/packages'),
        import('@/lib/repositories/catalog'),
        getSiteSettings(),
      ])
      const [packages, services] = await Promise.all([listPackages(), listServices()])
      const names = new Map(services.map((s) => [s.id, s.name]))
      const currency = settings.defaultCurrency
      const money = (piasters: number) => ({amount: piasters / 100, currency})

      return packages
        .filter((p) => p.active)
        .map((p): StudioPackage => {
          const hasBadge = p.badge.ar !== '' || p.badge.en !== ''
          const included = p.includes.flatMap((i) => {
            const name = names.get(i.serviceId)
            return name ? [{ar: `${i.quantity} × ${name.ar}`, en: `${i.quantity} × ${name.en || name.ar}`}] : []
          })
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            // The site's card shows `price` struck through next to `discountedPrice`.
            price: money(p.originalPrice ?? p.price),
            discountedPrice: p.originalPrice !== null ? money(p.price) : undefined,
            features: p.features.length > 0 ? p.features : included,
            includes: p.includes,
            badge: hasBadge ? p.badge : undefined,
            imageUrl: p.imageUrl || undefined,
            featured: p.featured,
            active: p.active,
            order: p.order,
          }
        })
    },
    [],
    'packages',
  ),
)

export const getPortfolioItems = cache(async (): Promise<PortfolioItem[]> => [])

export type BuilderData = {
  config: PricingConfig
  notes: {ar: string; en: string}
  categories: {id: string; name: {ar: string; en: string}}[]
}

/** Everything /build-package needs, or null when the builder has nothing buildable yet. */
export const getBuilderData = cache(async (): Promise<BuilderData | null> =>
  withFallback(
    async () => {
      const [{getPricingConfig, getBuilderConfig}, {listCategories}, settings] = await Promise.all([
        import('@/lib/repositories/pricing'),
        import('@/lib/repositories/catalog'),
        getSiteSettings(),
      ])
      if (!settings.builderEnabled) return null
      const [config, categories, builderConfig] = await Promise.all([getPricingConfig(), listCategories(), getBuilderConfig()])
      if (config.services.length === 0) return null
      return {
        config,
        notes: builderConfig.notes,
        categories: categories.filter((c) => c.active).map((c) => ({id: c.id, name: c.name})),
      }
    },
    null,
    'builder data',
  ),
)
