import {getTranslations} from 'next-intl/server'
import {Footer} from '@/components/layout/footer'
import {Header} from '@/components/layout/header'
import {ButtonLink} from '@/components/ui/button-link'
import {Container} from '@/components/ui/container'

/** Lives outside the (site) group, so it renders the public chrome itself. */
export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <>
      <Header />
      <main id="main">
        <Container className="py-24 text-center">
          <h1 className="text-4xl">{t('title')}</h1>
          <p className="mt-3 text-lg text-ink-soft">{t('text')}</p>
          <ButtonLink href="/" className="mt-8">
            {t('back')}
          </ButtonLink>
        </Container>
      </main>
      <Footer />
    </>
  )
}
