import type {Money} from './types'

/** Display formatting for a Money value expressed in whole currency units (e.g. EGP). */
export function formatMoney({amount, currency}: Money, locale: string): string {
  const tag = locale === 'ar' ? 'ar-EG' : 'en-EG'
  return new Intl.NumberFormat(tag, {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

/** Storage unit: integer piasters. 12500 piasters = 125 EGP. */
export function piastersToEgp(piasters: number): number {
  return piasters / 100
}

/** Formats integer piasters for display, e.g. 12500 -> "125 EGP" / "١٢٥ ج.م.". */
export function formatPiasters(piasters: number, currency: string, locale: string): string {
  return formatMoney({amount: piastersToEgp(piasters), currency}, locale)
}

/**
 * Parses what an admin typed ("125", "125.5", "١٢٥", "1,250.75") into integer piasters.
 * Returns null for empty or invalid input. Never returns a float or NaN.
 */
export function parseEgpToPiasters(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null
  const raw = typeof input === 'number' ? String(input) : input
  const normalized = raw
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/٫/g, '.')
    .replace(/[,٬\s]/g, '')
  if (normalized === '' || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const [whole, frac = ''] = normalized.split('.')
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'))
}

/** Integer piasters -> plain string for an <input> ("125" or "125.5"). */
export function piastersToInputValue(piasters: number | null | undefined): string {
  if (piasters === null || piasters === undefined) return ''
  const egp = piasters / 100
  return Number.isInteger(egp) ? String(egp) : egp.toFixed(2).replace(/0$/, '')
}
