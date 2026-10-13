import type {LucideIcon} from 'lucide-react'
import {cn} from '@/lib/utils'

export const inputClass =
  'w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-base text-ink placeholder:text-ink-soft/60 focus:border-brand disabled:cursor-not-allowed disabled:opacity-60'

export const iconButtonClass =
  'inline-grid size-9 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40'

export function Card({className, ...props}: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-2xl border border-line bg-surface p-5 sm:p-6', className)} {...props} />
}

export function PageTitle({title, description, actions}: {title: string; description?: string; actions?: React.ReactNode}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

const TONES = {
  neutral: 'border-line text-ink-soft',
  success: 'border-brand/50 bg-brand/10 text-brand',
  warning: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  danger: 'border-red-400/40 bg-red-400/10 text-red-300',
} as const

export function Badge({tone = 'neutral', children}: {tone?: keyof typeof TONES; children: React.ReactNode}) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold', TONES[tone])}>{children}</span>
}

export function EmptyState({icon: Icon, title, text, children}: {icon: LucideIcon; title: string; text?: string; children?: React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Icon aria-hidden className="size-7" />
      </span>
      <h2 className="text-xl">{title}</h2>
      {text && <p className="mx-auto mt-2 max-w-md text-ink-soft">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}

export const tableWrap = 'overflow-x-auto rounded-2xl border border-line bg-surface'
export const th = 'whitespace-nowrap border-b border-line px-4 py-3 text-start text-sm font-bold text-ink-soft'
export const td = 'border-b border-line/60 px-4 py-3 align-middle'

export const primaryButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-bold text-brand-ink transition-colors hover:bg-brand-hover disabled:opacity-60'
export const outlineButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-5 text-base font-bold text-ink transition-colors hover:border-brand hover:text-brand'
