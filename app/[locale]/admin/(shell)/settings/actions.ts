'use server'

import {bool, localized, str} from '@/lib/admin/form'
import {done, guarded, parseInput, revalidatePublicSite, type ActionState} from '@/lib/admin/action'
import {siteSettingsSchema} from '@/lib/models/settings'
import {writeSiteSettings} from '@/lib/repositories/settings'
import {normalizeWhatsAppNumber} from '@/lib/whatsapp'

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('settings:write', async (session) => {
    const input = parseInput(siteSettingsSchema, {
      studioName: localized(formData, 'studioName'),
      location: localized(formData, 'location'),
      whatsappNumber: normalizeWhatsAppNumber(str(formData, 'whatsappNumber')),
      phone: str(formData, 'phone'),
      email: str(formData, 'email'),
      socialLinks: {
        facebook: str(formData, 'facebook'),
        instagram: str(formData, 'instagram'),
        youtube: str(formData, 'youtube'),
        tiktok: str(formData, 'tiktok'),
      },
      defaultCurrency: str(formData, 'defaultCurrency') || 'EGP',
      builderEnabled: bool(formData, 'builderEnabled'),
    })
    await writeSiteSettings(input, session)
    revalidatePublicSite()
    return done('saved')
  })
}
