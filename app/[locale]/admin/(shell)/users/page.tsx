import {getTranslations} from 'next-intl/server'
import {RoleForm} from '@/components/admin/role-form'
import {ForbiddenState} from '@/components/admin/states'
import {Badge, PageTitle, tableWrap, td, th} from '@/components/admin/ui'
import {adminPage} from '@/lib/admin/page'
import {isRole} from '@/lib/auth/roles'
import {adminAuth, adminDb} from '@/lib/firebase/admin'
import {C} from '@/lib/repositories/base'

export default async function UsersPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {session, allowed} = await adminPage(locale, 'users:manage')
  if (!allowed) return <ForbiddenState />
  const [t, roles, listed, auditSnap] = await Promise.all([
    getTranslations('admin.users'),
    getTranslations('admin.users.roles'),
    adminAuth().listUsers(1000),
    adminDb().collection(C.audit).orderBy('at', 'desc').limit(30).get(),
  ])
  const holders = listed.users.filter((u) => isRole(u.customClaims?.role))
  const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {dateStyle: 'short', timeStyle: 'short'})

  return (
    <div className="space-y-10">
      <PageTitle title={t('title')} description={t('description')} />
      <RoleForm />

      <section>
        <h2 className="mb-3 text-xl">{t('adminsTitle')}</h2>
        <div className={tableWrap}>
          <table className="w-full min-w-[32rem]">
            <tbody>
              {holders.map((u) => (
                <tr key={u.uid}>
                  <td className={td} dir="ltr">
                    {u.email} {u.uid === session.uid && <Badge tone="success">{t('you')}</Badge>}
                  </td>
                  <td className={td}>
                    <Badge tone="warning">{roles(String(u.customClaims?.role))}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl">{t('auditTitle')}</h2>
        {auditSnap.empty ? (
          <p className="text-ink-soft">{t('noAudit')}</p>
        ) : (
          <div className={tableWrap}>
            <table className="w-full min-w-[40rem]">
              <thead>
                <tr>
                  <th className={th}>{t('when')}</th>
                  <th className={th}>{t('who')}</th>
                  <th className={th}>{t('what')}</th>
                  <th className={th}>{t('where')}</th>
                </tr>
              </thead>
              <tbody>
                {auditSnap.docs.map((d) => {
                  const data = d.data()
                  const at: Date | undefined = data.at?.toDate?.()
                  return (
                    <tr key={d.id}>
                      <td className={td}>{at ? fmt.format(at) : ''}</td>
                      <td className={td} dir="ltr">{String(data.actorEmail ?? '')}</td>
                      <td className={td}>{String(data.action ?? '')}</td>
                      <td className={td} dir="ltr">{`${data.collection}/${data.docId}`}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
