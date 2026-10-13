import {Container} from './container'

export function PageHeader({title, description}: {title: string; description?: string}) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-ink-soft">{description}</p>}
      </Container>
    </div>
  )
}
