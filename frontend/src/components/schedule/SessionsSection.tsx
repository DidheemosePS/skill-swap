import type { ReactNode } from 'react'

interface SessionsSectionProps {
  id: string
  title: string
  // A short fact about the section (a count, a credit total), on the heading's line.
  meta?: ReactNode
  children: ReactNode
}

// One section of the Sessions page: a heading over its own cards, with no panel around them.
export default function SessionsSection({ id, title, meta, children }: SessionsSectionProps) {
  return (
    <section aria-labelledby={id} className="mt-10 first-of-type:mt-8">
      {/* On phones the note drops under the heading rather than squeezing it onto two lines. */}
      <div className="mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 id={id} className="text-xl font-semibold text-ink">{title}</h2>
        {meta && <p className="text-sm text-muted">{meta}</p>}
      </div>
      {children}
    </section>
  )
}
