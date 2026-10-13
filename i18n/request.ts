import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'
import {routing} from './routing'

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  // Public site copy + admin dashboard copy (kept in a separate file per language).
  const [site, admin] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/admin.${locale}.json`),
  ])
  return {locale, messages: {...site.default, ...admin.default}}
})
