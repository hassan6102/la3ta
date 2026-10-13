import {ShoppingBag} from 'lucide-react'
import {ComingSoon, ForbiddenState} from '@/components/admin/states'
import {adminPage} from '@/lib/admin/page'

export default async function OrdersPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'orders:manage')
  if (!allowed) return <ForbiddenState />
  return <ComingSoon name="orders" icon={ShoppingBag} />
}
