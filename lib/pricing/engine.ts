import type {
  DiscountLine,
  LineItem,
  OptionLine,
  PricingConfig,
  PricingEffect,
  Quote,
  QuoteIssue,
  Selection,
  ServiceLine,
} from './types'

/**
 * Pure pricing engine: no I/O, no randomness, no clock.
 * The browser calls it for a live estimate; the server calls it again with the current
 * Firestore configuration to produce the authoritative quote. A total sent by a client is never used.
 *
 * Order of operations (all integer piasters):
 *  1. service lines = quantity x unit price
 *  2. option lines  = flat | per_unit | percent effects (percent uses service lines only, so it
 *                     never depends on the order of the options)
 *  3. subtotal      = service lines + option lines
 *  4. discounts     = every active discount whose minimum is met, capped at the subtotal
 *  5. rounding      = nearest multiple of config.roundTo
 *  6. minimum total = reported as an issue, never silently raised
 */
export function calculateQuote(config: PricingConfig, selection: Selection): Quote {
  const issues: QuoteIssue[] = []
  const services = new Map(config.services.map((s) => [s.id, s]))
  const options = new Map(config.options.map((o) => [o.id, o]))

  // 1 ── services
  const serviceLines: ServiceLine[] = []
  const seenServices = new Set<string>()
  for (const item of selection.items) {
    const def = services.get(item.serviceId)
    if (!def) {
      issues.push({code: 'unknown_service', refId: item.serviceId})
      continue
    }
    if (seenServices.has(def.id)) {
      issues.push({code: 'duplicate_service', refId: def.id})
      continue
    }
    seenServices.add(def.id)
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 0) {
      issues.push({code: 'invalid_quantity', refId: def.id})
      continue
    }
    if (item.quantity === 0) continue
    if (!def.active || !def.builderEnabled || def.unitPrice === null) {
      issues.push({code: 'service_unavailable', refId: def.id})
      continue
    }
    const step = Math.max(1, def.step)
    const inRange = item.quantity >= def.minQty && item.quantity <= def.maxQty
    const onStep = (item.quantity - def.minQty) % step === 0
    if (!inRange || !onStep) {
      issues.push({code: 'quantity_out_of_range', refId: def.id})
      continue
    }
    serviceLines.push({
      kind: 'service',
      serviceId: def.id,
      name: def.name,
      unit: def.unit,
      quantity: item.quantity,
      unitPrice: def.unitPrice,
      total: item.quantity * def.unitPrice,
    })
  }

  const serviceById = new Map(serviceLines.map((l) => [l.serviceId, l]))

  // 2 ── options
  const optionLines: OptionLine[] = []
  const seenOptions = new Set<string>()
  for (const picked of selection.options) {
    const def = options.get(picked.optionId)
    if (!def) {
      issues.push({code: 'unknown_option', refId: picked.optionId})
      continue
    }
    if (seenOptions.has(def.id)) {
      issues.push({code: 'duplicate_option', refId: def.id})
      continue
    }
    seenOptions.add(def.id)
    if (!def.active) {
      issues.push({code: 'option_unavailable', refId: def.id})
      continue
    }
    const choice = def.choices.find((c) => c.id === picked.choiceId)
    if (!choice) {
      issues.push({code: 'unknown_choice', refId: def.id})
      continue
    }
    optionLines.push({
      kind: 'option',
      optionId: def.id,
      choiceId: choice.id,
      name: def.name,
      label: choice.label,
      effectType: choice.effect.type,
      total: effectAmount(choice.effect, serviceById),
    })
  }
  for (const def of config.options) {
    if (def.active && def.required && !seenOptions.has(def.id)) {
      issues.push({code: 'required_option_missing', refId: def.id})
    }
  }

  const lineItems: LineItem[] = [...serviceLines, ...optionLines]
  if (serviceLines.length === 0) issues.push({code: 'empty_selection'})

  // 3 ── subtotal
  const subtotal = lineItems.reduce((sum, l) => sum + l.total, 0)

  // 4 ── discounts
  const discounts: DiscountLine[] = []
  let remaining = subtotal
  for (const d of config.discounts) {
    if (!d.active || subtotal < d.minSubtotal || remaining <= 0) continue
    const raw = d.type === 'percent' ? Math.round((subtotal * d.value) / 100) : d.value
    const amount = Math.min(Math.max(0, raw), remaining)
    if (amount > 0) {
      discounts.push({discountId: d.id, name: d.name, amount})
      remaining -= amount
    }
  }

  // 5 ── rounding
  let total = remaining
  if (config.roundTo > 0) total = Math.round(total / config.roundTo) * config.roundTo

  // 6 ── minimum
  if (serviceLines.length > 0 && total < config.minTotal) issues.push({code: 'below_min_total'})

  return {
    valid: issues.length === 0,
    issues,
    currency: config.currency,
    lineItems,
    subtotal,
    discounts,
    total,
    pricingRevision: config.revision,
  }
}

function effectAmount(effect: PricingEffect, serviceLines: Map<string, ServiceLine>): number {
  const targets =
    effect.type === 'flat'
      ? []
      : effect.targetServiceIds.length > 0
        ? effect.targetServiceIds.map((id) => serviceLines.get(id)).filter((l): l is ServiceLine => Boolean(l))
        : [...serviceLines.values()]

  switch (effect.type) {
    case 'flat':
      return effect.amount
    case 'per_unit':
      return effect.amount * targets.reduce((sum, l) => sum + l.quantity, 0)
    case 'percent':
      return Math.round((targets.reduce((sum, l) => sum + l.total, 0) * effect.percent) / 100)
  }
}
