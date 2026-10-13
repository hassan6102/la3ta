import {Images} from 'lucide-react'
import {ComingSoon, ForbiddenState} from '@/components/admin/states'
import {adminPage} from '@/lib/admin/page'

export default async function PortfolioPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params
  const {allowed} = await adminPage(locale, 'content:write')
  if (!allowed) return <ForbiddenState />
  return <ComingSoon name="portfolio" icon={Images} />
}
