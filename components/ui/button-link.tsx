import {cva, type VariantProps} from 'class-variance-authority'
import {Link} from '@/i18n/navigation'
import {cn} from '@/lib/utils'

export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl px-6 text-base font-bold transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-ink hover:bg-brand-hover',
        outline: 'border border-line text-ink hover:border-brand hover:text-brand',
        whatsapp: 'bg-whatsapp text-brand-ink hover:bg-whatsapp-hover',
      },
      size: {
        md: 'min-h-12',
        lg: 'min-h-14 px-8 text-lg',
      },
    },
    defaultVariants: {variant: 'primary', size: 'md'},
  },
)

type Props = VariantProps<typeof buttonStyles> & {
  href: string
  /** Use for absolute URLs such as WhatsApp. Opens in a new tab. */
  external?: boolean
  className?: string
  children: React.ReactNode
}

export function ButtonLink({href, external, variant, size, className, children}: Props) {
  const classes = cn(buttonStyles({variant, size}), className)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
