'use client'

import {CheckCircle2, XCircle} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {createContext, useCallback, useContext, useState} from 'react'
import type {ActionState} from '@/lib/admin/types'
import {cn} from '@/lib/utils'

type Toast = {id: number; tone: 'success' | 'error'; text: string}
type Push = (toast: {tone: 'success' | 'error'; text: string}) => void

const ToastContext = createContext<Push>(() => {})

export function ToastProvider({children}: {children: React.ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback<Push>((toast) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-3), {...toast, id}])
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 5000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 start-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-xl border bg-surface-2 px-4 py-3 text-sm font-semibold shadow-lg shadow-black/40',
              toast.tone === 'success' ? 'border-brand/60' : 'border-red-400/60',
            )}
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
            ) : (
              <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-red-400" />
            )}
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

/** Turns an action result into a translated toast. */
export function useNotify() {
  const push = useToast()
  const t = useTranslations('admin.result')
  return useCallback(
    (state: ActionState) => {
      if (state) push({tone: state.ok ? 'success' : 'error', text: t(state.code)})
    },
    [push, t],
  )
}
