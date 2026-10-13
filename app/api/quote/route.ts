import {NextResponse, type NextRequest} from 'next/server'
import {z} from 'zod'
import {isAdminConfigured} from '@/lib/firebase/admin'
import {calculateQuote} from '@/lib/pricing/engine'
import {getPricingConfig} from '@/lib/repositories/pricing'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  items: z.array(z.object({serviceId: z.string().min(1).max(100), quantity: z.number()})).max(60),
  options: z.array(z.object({optionId: z.string().min(1).max(100), choiceId: z.string().min(1).max(100)})).max(60),
})

/**
 * Authoritative quote. The request carries only WHAT was selected (ids and quantities).
 * Prices always come from the current Firestore configuration; a total sent by the browser would be ignored.
 * Orders (a later phase) must go through this same calculation before being stored.
 */
export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) return NextResponse.json({code: 'not_configured'}, {status: 503})
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({code: 'invalid_request'}, {status: 400})

  const config = await getPricingConfig()
  const quote = calculateQuote(config, parsed.data)
  return NextResponse.json({quote}, {headers: {'Cache-Control': 'no-store'}})
}
