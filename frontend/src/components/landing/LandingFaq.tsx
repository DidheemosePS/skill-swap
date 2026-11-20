const QUESTIONS = [
  {
    q: 'Is it really free?',
    a: 'Yes. There is nothing to buy. Credits can only be earned by teaching, and mutual swaps don’t use credits at all. No card, no subscription, no paid tier.',
  },
  {
    q: 'What if nobody wants my skill?',
    a: 'That’s exactly what credits solve. You don’t need someone who wants your skill and teaches the one you want. Teach anyone who’s interested, earn a credit, and spend it with any mentor. The match doesn’t have to be mutual.',
  },
  {
    q: 'What happens if someone doesn’t show up?',
    a: 'Your credit comes back. The meeting records who joined, and each session settles from that record 24 hours after it ends. Missed sessions and late cancellations cost members their reliability standing.',
  },
  {
    q: 'What counts as a skill?',
    a: 'Anything you can teach in a one-hour online session: a language, an instrument, sourdough, spreadsheets, salsa steps, interview practice. If someone wants to learn it, it belongs here.',
  },
]

// Native details/summary: the platform handles toggling, keyboard and semantics.
// The heading sits beside the questions from md up, so the band has no dead half.
export default function LandingFaq() {
  return (
    <section className="bg-card">
      <div className="mx-auto grid max-w-6xl gap-x-14 px-4 py-14 md:grid-cols-[1fr_1.6fr] md:items-start lg:py-18">
        <h2 className="font-display text-3xl font-semibold text-balance text-ink sm:text-4xl">Common questions</h2>
        <div className="mt-5 border-b border-line md:mt-1.5">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-t border-line">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4 shrink-0 text-faint transition-transform group-open:rotate-45 motion-reduce:transition-none">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="pb-4 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
