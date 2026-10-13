import {describe, expect, it} from 'vitest'
import {calculateQuote} from './engine'
import type {PricingConfig, Selection} from './types'

const L = (s: string) => ({ar: s, en: s})

/** Test fixture only: these numbers are NOT real SIRA prices. */
const config: PricingConfig = {
  currency: 'EGP',
  revision: 7,
  minTotal: 0,
  roundTo: 0,
  discounts: [],
  services: [
    {id: 'lecture', categoryId: 'video', name: L('Lecture'), unit: 'per_lecture', unitPrice: 1000, active: true, builderEnabled: true, minQty: 1, maxQty: 50, step: 1, defaultQty: 1},
    {id: 'thumb', categoryId: 'design', name: L('Thumb'), unit: 'per_design', unitPrice: 300, active: true, builderEnabled: true, minQty: 1, maxQty: 100, step: 1, defaultQty: 1},
    {id: 'unpriced', categoryId: 'design', name: L('X'), unit: 'per_item', unitPrice: null, active: true, builderEnabled: true, minQty: 1, maxQty: 10, step: 1, defaultQty: 1},
    {id: 'hidden', categoryId: 'design', name: L('H'), unit: 'per_item', unitPrice: 500, active: true, builderEnabled: false, minQty: 1, maxQty: 10, step: 1, defaultQty: 1},
    {id: 'pairs', categoryId: 'video', name: L('Pairs'), unit: 'per_item', unitPrice: 100, active: true, builderEnabled: true, minQty: 2, maxQty: 10, step: 2, defaultQty: 2},
  ],
  options: [
    {id: 'subs', name: L('Subs'), type: 'toggle', required: false, active: true, choices: [{id: 'on', label: L('On'), effect: {type: 'flat', amount: 5000}}]},
    {
      id: 'quality', name: L('Quality'), type: 'select', required: false, active: true,
      choices: [
        {id: 'hd', label: L('HD'), effect: {type: 'flat', amount: 0}},
        {id: '4k', label: L('4K'), effect: {type: 'percent', percent: 20, targetServiceIds: ['lecture']}},
      ],
    },
    {id: 'cams', name: L('Cams'), type: 'select', required: false, active: true, choices: [{id: 'two', label: L('Two'), effect: {type: 'per_unit', amount: 200, targetServiceIds: ['lecture']}}]},
    {id: 'must', name: L('Must'), type: 'select', required: true, active: true, choices: [{id: 'a', label: L('A'), effect: {type: 'flat', amount: 0}}]},
  ],
}

const pick = (s: Partial<Selection>): Selection => ({items: [], options: [{optionId: 'must', choiceId: 'a'}], ...s})

describe('calculateQuote', () => {
  it('multiplies quantity by unit price and reports the revision', () => {
    const q = calculateQuote(config, pick({items: [{serviceId: 'lecture', quantity: 10}, {serviceId: 'thumb', quantity: 5}]}))
    expect(q.valid).toBe(true)
    expect(q.subtotal).toBe(10 * 1000 + 5 * 300)
    expect(q.total).toBe(11500)
    expect(q.pricingRevision).toBe(7)
  })

  it('applies flat, per_unit and percent effects', () => {
    const q = calculateQuote(config, {
      items: [{serviceId: 'lecture', quantity: 10}],
      options: [
        {optionId: 'must', choiceId: 'a'},
        {optionId: 'subs', choiceId: 'on'},
        {optionId: 'quality', choiceId: '4k'},
        {optionId: 'cams', choiceId: 'two'},
      ],
    })
    // 10000 + 5000 flat + 2000 (20% of 10000) + 2000 (200 x 10)
    expect(q.total).toBe(19000)
  })

  it('ignores option order for percent effects', () => {
    const a = calculateQuote(config, {items: [{serviceId: 'lecture', quantity: 2}], options: [{optionId: 'must', choiceId: 'a'}, {optionId: 'subs', choiceId: 'on'}, {optionId: 'quality', choiceId: '4k'}]})
    const b = calculateQuote(config, {items: [{serviceId: 'lecture', quantity: 2}], options: [{optionId: 'quality', choiceId: '4k'}, {optionId: 'subs', choiceId: 'on'}, {optionId: 'must', choiceId: 'a'}]})
    expect(a.total).toBe(b.total)
  })

  it('rejects unknown, hidden and unpriced services', () => {
    for (const id of ['nope', 'hidden', 'unpriced']) {
      const q = calculateQuote(config, pick({items: [{serviceId: id, quantity: 1}, {serviceId: 'lecture', quantity: 1}]}))
      expect(q.valid).toBe(false)
    }
  })

  it('validates quantities: float, negative, range, step', () => {
    const bad = [1.5, -1, 51, 0.1, Number.NaN]
    for (const quantity of bad) {
      expect(calculateQuote(config, pick({items: [{serviceId: 'lecture', quantity}]})).valid).toBe(false)
    }
    expect(calculateQuote(config, pick({items: [{serviceId: 'pairs', quantity: 3}]})).valid).toBe(false)
    expect(calculateQuote(config, pick({items: [{serviceId: 'pairs', quantity: 4}]})).valid).toBe(true)
  })

  it('treats quantity 0 as not selected and flags an empty selection', () => {
    const q = calculateQuote(config, pick({items: [{serviceId: 'lecture', quantity: 0}]}))
    expect(q.issues.map((i) => i.code)).toContain('empty_selection')
    expect(q.total).toBe(0)
  })

  it('rejects duplicates, unknown choices and missing required options', () => {
    expect(calculateQuote(config, pick({items: [{serviceId: 'lecture', quantity: 1}, {serviceId: 'lecture', quantity: 2}]})).valid).toBe(false)
    expect(calculateQuote(config, {items: [{serviceId: 'lecture', quantity: 1}], options: []}).issues.map((i) => i.code)).toContain('required_option_missing')
    expect(calculateQuote(config, {items: [{serviceId: 'lecture', quantity: 1}], options: [{optionId: 'must', choiceId: 'zzz'}]}).valid).toBe(false)
  })

  it('applies percent and fixed discounts, capped at the subtotal', () => {
    const withDiscounts: PricingConfig = {
      ...config,
      discounts: [
        {id: 'd1', name: L('10%'), type: 'percent', value: 10, minSubtotal: 5000, active: true},
        {id: 'd2', name: L('big'), type: 'fixed', value: 99999999, minSubtotal: 0, active: true},
        {id: 'off', name: L('off'), type: 'percent', value: 50, minSubtotal: 0, active: false},
      ],
    }
    const q = calculateQuote(withDiscounts, pick({items: [{serviceId: 'lecture', quantity: 10}]}))
    expect(q.discounts.map((d) => d.discountId)).toEqual(['d1', 'd2'])
    expect(q.total).toBe(0)
  })

  it('rounds and enforces the minimum without silently raising the total', () => {
    const q = calculateQuote({...config, roundTo: 500, minTotal: 20000}, pick({items: [{serviceId: 'lecture', quantity: 1}, {serviceId: 'thumb', quantity: 1}]}))
    expect(q.total).toBe(1500)
    expect(q.issues.map((i) => i.code)).toContain('below_min_total')
  })
})
