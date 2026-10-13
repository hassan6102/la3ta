import {getTranslations} from 'next-intl/server'
import {Footer} from '@/components/layout/footer'
import {Header} from '@/components/layout/header'
import {WhatsAppFloat} from '@/components/whatsapp/whatsapp-float'

/** Public website chrome. The admin dashboard lives outside this group and has its own shell. */
export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const skip = (await getTranslations('common'))('skip')
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-bold focus:text-brand-ink"
      >
        {skip}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
