import {cn} from '@/lib/utils'
import {Container} from './container'

export function Section({className, children, ...props}: React.ComponentProps<'section'>) {
  return (
    <section className={cn('py-14 sm:py-20', className)} {...props}>
      <Container>{children}</Container>
    </section>
  )
}

export function SectionHeading({title, description, className}: {title: string; description?: string; className?: string}) {
  return (
    <div className={cn('mb-10 max-w-2xl', className)}>
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-lg text-ink-soft">{description}</p>}
    </div>
  )
}
