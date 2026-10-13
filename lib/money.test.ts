import {describe, expect, it} from 'vitest'
import {parseEgpToPiasters, piastersToInputValue} from './money'

describe('money', () => {
  it('converts EGP input to integer piasters', () => {
    expect(parseEgpToPiasters('125')).toBe(12500)
    expect(parseEgpToPiasters('500')).toBe(50000)
    expect(parseEgpToPiasters('1500')).toBe(150000)
    expect(parseEgpToPiasters('125.5')).toBe(12550)
    expect(parseEgpToPiasters('0.07')).toBe(7)
    expect(parseEgpToPiasters('1,250.75')).toBe(125075)
  })
  it('accepts Arabic digits', () => {
    expect(parseEgpToPiasters('١٢٥')).toBe(12500)
    expect(parseEgpToPiasters('١٢٥٫٥')).toBe(12550)
  })
  it('rejects invalid input instead of guessing', () => {
    for (const bad of ['', 'abc', '-5', '1.234', '1e3', '12 .5.1']) expect(parseEgpToPiasters(bad)).toBe(null)
  })
  it('never produces floating point drift', () => {
    expect(parseEgpToPiasters('19.99')).toBe(1999)
    expect(Number.isInteger(parseEgpToPiasters('0.29'))).toBe(true)
  })
  it('formats piasters for an input box', () => {
    expect(piastersToInputValue(12500)).toBe('125')
    expect(piastersToInputValue(12550)).toBe('125.5')
    expect(piastersToInputValue(null)).toBe('')
  })
})
