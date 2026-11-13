import type { ReactNode } from 'react'

interface PlumNoteProps {
  id?: string
  label: string
  headline: string
  sub?: string
  // The two people in the swap, shown at the card's left on wide screens.
  pair?: ReactNode
  children: ReactNode
}

// The dark card that means "your move": a reply owed, a session to join or an outcome to answer. The same card
// as the dashboard's now card, so the two read as one thing.
export default function PlumNote({ id, label, headline, sub, pair, children }: PlumNoteProps) {
  return (
    <section data-request-id={id} aria-label={`${label}: ${headline}`} className="rounded-2xl bg-next p-4 text-white/75 sm:p-5">
      <div className="flex items-center gap-4">
        {pair && <div className="hidden sm:block">{pair}</div>}
        <div className="min-w-0">
          <p className="text-sm">{label}</p>
          <h2 className="mt-0.5 text-lg font-semibold text-balance text-white sm:text-xl">{headline}</h2>
          {sub && <p className="mt-0.5 text-sm">{sub}</p>}
        </div>
      </div>
      {/* Tighter on phones, so the card and the conversation share the screen. */}
      <div className="mt-3 border-t border-white/15 pt-3 sm:mt-4 sm:pt-4">{children}</div>
    </section>
  )
}
