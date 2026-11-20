const check = (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.75 size-3.75 shrink-0 text-success">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

// Trust comes from the rules, not from invented social proof (pre-launch: no
// testimonials, counts or ratings anywhere on this page). The escrow wording and
// badge criteria restate PRODUCT.md; keep them in step with it.
export default function TrustPanel() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 lg:py-18">
      <h2 className="font-display text-3xl font-semibold text-balance text-ink sm:text-4xl">Built so an hour is safe to give</h2>
      <dl className="mt-7 grid gap-x-12 md:grid-cols-2">
        <div className="border-t border-line py-5">
          <dt className="font-semibold text-ink">Credits wait until the hour is done</dt>
          <dd className="mt-1.5 text-sm text-muted">
            When you book with a credit, it’s held, not handed over. The teacher gets it only once the session is complete. It comes back if they decline, the request expires, or they don’t show up.
          </dd>
        </div>
        <div className="border-t border-line py-5">
          <dt className="font-semibold text-ink">The Reliable Swapper badge</dt>
          <dd className="mt-1.5 text-sm text-muted">
            Earned, never bought. A member qualifies only when all three hold:
            <ul className="mt-2 flex flex-col gap-1">
              <li className="flex gap-2">{check}<span className="figures">5+ completed sessions with a 95%+ attendance rate</span></li>
              <li className="flex gap-2">{check}<span className="figures">An average rating of 4.8★ or higher</span></li>
              <li className="flex gap-2">{check}<span className="figures">No attendance disputes ruled against them in 30 days</span></li>
            </ul>
          </dd>
        </div>
        <div className="border-t border-line py-5">
          <dt className="font-semibold text-ink">One hour, online</dt>
          <dd className="mt-1.5 text-sm text-muted">
            Sessions are fixed at one hour with an auto-generated meeting link. The join button opens ten minutes before the start, and the meeting records who joined, so every session settles from that record, not from anyone’s word.
          </dd>
        </div>
        <div className="border-t border-line py-5">
          <dt className="font-semibold text-ink">Both sides rate</dt>
          <dd className="mt-1.5 text-sm text-muted">Teacher and learner rate every completed session. Reputation here is built from hours actually taught, nothing else.</dd>
        </div>
      </dl>
    </section>
  )
}
