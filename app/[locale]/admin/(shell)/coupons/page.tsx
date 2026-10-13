import {Ticket} from 'lucide-react'
import {ComingSoon, ForbiddenState} from '@/components/admin/states'
import {adminPage} from '@/lib/admin/page'

export default async function CouponsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'discounts:write')
  if (!allowed) return <ForbiddenState />
  return <ComingSoon name="coupons" icon={Ticket} />
}
