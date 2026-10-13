import {getTranslations} from 'next-intl/server'
import {Section, SectionHeading} from '@/components/ui/section'

const STEPS = ['choose', 'order', 'confirm', 'deliver'] as const

export async function ProcessSteps() {
  const t = await getTranslations('home')
  return (
    <Section>
      <SectionHeading title={t('processTitle')} />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step} className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-4 grid size-10 place-items-center rounded-full bg-brand font-extrabold text-brand-ink">{i + 1}</span>
            <h3 className="text-xl">{t(`steps.${step}.title`)}</h3>
            <p className="mt-2 text-ink-soft">{t(`steps.${step}.text`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
