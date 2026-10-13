/**
 * Pricing is always quantity × unit price, where the unit price comes from the
 * services data (Firestore), never from constants in the UI.
 * The full builder + coupon logic arrives in Phase 3.
 */
export function lineTotal(quantity: number, unitPrice: number): number {
  return Math.max(0, quantity) * unitPrice
}
