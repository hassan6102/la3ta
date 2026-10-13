'use client'

import {Loader2} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useRef, useTransition} from 'react'
import {useRouter} from '@/i18n/navigation'
import type {ActionState} from '@/lib/admin/types'
import {cn} from '@/lib/utils'
import {useNotify} from './toast'
import {iconButtonClass} from './ui'

type Props = {
  /** A server action taking FormData. */
  action: (formData: FormData) => Promise<ActionState>
  fields: Record<string, string>
  label: string
  children: React.ReactNode
  /** Ask for confirmation in a dialog first (use for deletes). */
  confirm?: boolean
  disabled?: boolean
  danger?: boolean
  /** Render as a text button instead of an icon button. */
  text?: boolean
}

/** A button that runs a server action (delete, move, toggle...) with optional confirm dialog and feedback. */
export function ActionButton({action, fields, label, children, confirm, disabled, danger, text}: Props) {
  const [pending, startTransition] = useTransition()
  const dialog = useRef<HTMLDialogElement>(null)
  const notify = useNotify()
  const router = useRouter()
  const t = useTranslations('admin.common')

  function run() {
    dialog.current?.close()
    startTransition(async () => {
      const formData = new FormData()
      for (const [key, value] of Object.entries(fields)) formData.set(key, value)
      notify(await action(formData))
      router.refresh()
    })
  }

  const className = text
    ? cn(
        'inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-bold transition-colors disabled:opacity-50',
        danger ? 'border-red-400/50 text-red-300 hover:bg-red-400/10' : 'border-line text-ink hover:border-brand hover:text-brand',
      )
    : cn(iconButtonClass, danger && 'hover:border-red-400 hover:text-red-400')

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        disabled={disabled || pending}
        className={className}
        onClick={() => (confirm ? dialog.current?.showModal() : run())}
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : children}
        {text && label}
      </button>
      {confirm && (
        <dialog
          ref={dialog}
          className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-6 text-ink backdrop:bg-black/70"
        >
          <h2 className="text-xl">{t('deleteTitle')}</h2>
          <p className="mt-2 text-ink-soft">{t('deleteText')}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="min-h-10 rounded-lg border border-line px-4 font-bold hover:border-brand" onClick={() => dialog.current?.close()}>
              {t('cancel')}
            </button>
            <button type="button" className="min-h-10 rounded-lg bg-red-500 px-4 font-bold text-white hover:bg-red-400" onClick={run}>
              {label}
            </button>
          </div>
        </dialog>
      )}
    </>
  )
}
