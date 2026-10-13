import type {LocalizedText} from './types'

export function localize(text: LocalizedText, locale: string): string {
  return locale === 'en' ? text.en || text.ar : text.ar || text.en
}
