import {Clapperboard} from 'lucide-react'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {LoginForm} from '@/components/admin/login-form'
import {NotConfiguredState} from '@/components/admin/states'
import {Card} from '@/components/admin/ui'
import {LanguageSwitcher} from '@/components/layout/language-switcher'
import {Link, redirect} from '@/i18n/navigation'
import {getAdminSession} from '@/lib/auth/session'
import {isAdminConfigured} from '@/lib/firebase/admin'

export default async function AdminLoginPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  setRequestLocale(locale)
  if (await getAdminSession()) redirect({href: '/admin', locale})
  const [t, common] = await Promise.all([getTranslations('admin.login'), getTranslations('common')])

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <span className="grid size-12 place-items-center rounded-xl bg-brand text-brand-ink">
            <Clapperboard aria-hidden className="size-6" />
          </span>
          <LanguageSwitcher label={common('switchLanguage')} />
        </div>
        {isAdminConfigured() ? (
          <Card className="p-6 sm:p-8">
            <h1 className="text-2xl">{t('title')}</h1>
            <p className="mt-1 mb-6 text-ink-soft">{t('description')}</p>
            <LoginForm />
          </Card>
        ) : (
          <NotConfiguredState />
        )}
        <p className="mt-6 text-center">
          <Link href="/" className="text-ink-soft hover:text-brand">
            {t('backToSite')}
          </Link>
        </p>
      </div>
    </div>
  )
}
