/** Builds a wa.me link. The number comes from site settings, never hardcoded in components. */
export function buildWhatsAppUrl(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Normalizes what an admin typed into international digits without "+".
 * "+20 100 000 0000" -> "201000000000", "01000000000" -> "201000000000". Returns "" for empty input.
 */
export function normalizeWhatsAppNumber(input: string): string {
  let digits = input
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = `20${digits.slice(1)}`
  return digits
}
