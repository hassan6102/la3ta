import {Container} from '@/components/ui/container'
import {WhatsAppButton} from '@/components/whatsapp/whatsapp-button'

export function CtaBand({title, text, message}: {title: string; text: string; message: string}) {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-brand/40 bg-surface p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl">{title}</h2>
            <p className="mt-2 text-lg text-ink-soft">{text}</p>
          </div>
          <WhatsAppButton size="lg" message={message} />
        </div>
      </Container>
    </section>
  )
}
