/**
 * Pricing model shared by the browser (live estimate) and the server (authoritative quote).
 * Every amount is an integer number of piasters. This file must stay free of runtime imports.
 */

export type LocalizedLabel = {ar: string; en: string}

export type PricingUnit = 'per_lecture' | 'per_hour' | 'per_video' | 'per_design' | 'per_item' | 'flat'

export type PricingEffect =
  /** Adds a fixed amount once. */
  | {type: 'flat'; amount: number}
  /** Adds `amount` for every unit of the target services in the selection (empty targets = all selected services). */
  | {type: 'per_unit'; amount: number; targetServiceIds: string[]}
  /** Adds `percent`% of the line totals of the target services (empty targets = all selected services). */
  | {type: 'percent'; percent: number; targetServiceIds: string[]}

export type PricingChoice = {id: string; label: LocalizedLabel; effect: PricingEffect}

export type PricingOptionDef = {
  id: string
  name: LocalizedLabel
  /** `select`: pick one choice. `toggle`: a single choice with id "on". */
  type: 'select' | 'toggle'
  required: boolean
  active: boolean
  choices: PricingChoice[]
}

export type PricingServiceDef = {
  id: string
  categoryId: string
  name: LocalizedLabel
  unit: PricingUnit
  /** Integer piasters, or null when the studio has not set a price (service is not buildable). */
  unitPrice: number | null
  active: boolean
  builderEnabled: boolean
  minQty: number
  maxQty: number
  step: number
  defaultQty: number
}

export type AutoDiscountDef = {
  id: string
  name: LocalizedLabel
  type: 'percent' | 'fixed'
  /** percent: 0-100. fixed: piasters. */
  value: number
  /** Only applies when the subtotal is at least this many piasters. */
  minSubtotal: number
  active: boolean
}

export type PricingConfig = {
  currency: string
  /** Bumped on every pricing-related write, so clients can detect a stale estimate. */
  revision: number
  services: PricingServiceDef[]
  options: PricingOptionDef[]
  discounts: AutoDiscountDef[]
  /** Smallest total the studio accepts for a custom package (0 = no minimum). */
  minTotal: number
  /** Round the total to the nearest multiple of this many piasters (0 = no rounding). */
  roundTo: number
}

export type Selection = {
  items: {serviceId: string; quantity: number}[]
  options: {optionId: string; choiceId: string}[]
}

export type QuoteIssueCode =
  | 'empty_selection'
  | 'unknown_service'
  | 'service_unavailable'
  | 'duplicate_service'
  | 'invalid_quantity'
  | 'quantity_out_of_range'
  | 'unknown_option'
  | 'option_unavailable'
  | 'duplicate_option'
  | 'unknown_choice'
  | 'required_option_missing'
  | 'below_min_total'

export type QuoteIssue = {code: QuoteIssueCode; refId?: string}

export type ServiceLine = {
  kind: 'service'
  serviceId: string
  name: LocalizedLabel
  unit: PricingUnit
  quantity: number
  unitPrice: number
  total: number
}

export type OptionLine = {
  kind: 'option'
  optionId: string
  choiceId: string
  name: LocalizedLabel
  label: LocalizedLabel
  effectType: PricingEffect['type']
  total: number
}

export type LineItem = ServiceLine | OptionLine

export type DiscountLine = {discountId: string; name: LocalizedLabel; amount: number}

export type Quote = {
  /** False when `issues` is not empty. Never accept an order from an invalid quote. */
  valid: boolean
  issues: QuoteIssue[]
  currency: string
  lineItems: LineItem[]
  subtotal: number
  discounts: DiscountLine[]
  /** Final amount in piasters. */
  total: number
  pricingRevision: number
}
