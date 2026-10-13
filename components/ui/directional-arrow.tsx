import {ArrowRight} from 'lucide-react'
import {cn} from '@/lib/utils'

/** Arrow that points "forward" in both LTR and RTL. */
export function DirectionalArrow({className}: {className?: string}) {
  return <ArrowRight aria-hidden className={cn('size-5 rtl:rotate-180', className)} />
}
