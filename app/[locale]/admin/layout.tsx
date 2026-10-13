import type {Metadata} from 'next'
import {ToastProvider} from '@/components/admin/toast'

export const metadata: Metadata = {
  title: {absolute: 'SIRA Admin'},
  robots: {index: false, follow: false},
}

export default function AdminRootLayout({children}: {children: React.ReactNode}) {
  return <ToastProvider>{children}</ToastProvider>
}
