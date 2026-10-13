import 'server-only'
import {DEFAULT_SETTINGS} from '@/lib/data/defaults'
import {adminDb} from '@/lib/firebase/admin'
import type {SiteSettingsDoc, SiteSettingsInput} from '@/lib/models/settings'
import {audit, C, snapToObject, serverTime, type Actor} from './base'

const DEFAULT_INPUT: SiteSettingsInput = {
  studioName: DEFAULT_SETTINGS.studioName,
  location: DEFAULT_SETTINGS.location,
  whatsappNumber: '',
  phone: '',
  email: '',
  socialLinks: {facebook: '', instagram: '', youtube: '', tiktok: ''},
  defaultCurrency: DEFAULT_SETTINGS.defaultCurrency,
  builderEnabled: true,
}

/** settings/site merged over defaults, plus whether the document exists yet. */
export async function readSiteSettings(): Promise<{settings: SiteSettingsDoc; exists: boolean}> {
  const snap = await adminDb().collection(C.settings).doc('site').get()
  const stored = snapToObject<Partial<SiteSettingsDoc>>(snap)
  const settings: SiteSettingsDoc = {
    ...DEFAULT_INPUT,
    ...stored,
    socialLinks: {...DEFAULT_INPUT.socialLinks, ...stored?.socialLinks},
  }
  return {settings, exists: Boolean(stored)}
}

export async function writeSiteSettings(input: SiteSettingsInput, actor: Actor): Promise<void> {
  const ref = adminDb().collection(C.settings).doc('site')
  const exists = (await ref.get()).exists
  await ref.set({...input, ...(exists ? {} : {createdAt: serverTime()}), updatedAt: serverTime(), updatedBy: actor.uid}, {merge: true})
  await audit(actor, 'update', C.settings, 'site')
}
