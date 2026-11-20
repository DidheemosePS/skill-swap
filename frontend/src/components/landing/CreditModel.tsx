import SwapPair from '../common/SwapPair'

// The hybrid model, told with figures and faces: the free mutual equation first,
// then earn → spend as two ledger cards. The app hides credit mechanics behind the
// tour; here explaining them is the landing page's job, so the figures lead.
export default function CreditModel() {
  return (
    <section id="credits" className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:py-18">
        <h2 className="font-display text-3xl font-semibold text-balance text-ink sm:text-4xl">What an hour costs</h2>
        <p className="mt-2.5 max-w-xl text-muted">Most platforms charge money. Here the only thing you can spend is an hour you taught.</p>

        <div className="mt-8 flex flex-wrap items-center gap-3.5 rounded-2xl border border-line bg-surface px-5 py-4.5">
          <span className="figures font-display text-[1.375rem] font-semibold whitespace-nowrap text-ink">1 h ↔ 1 h</span>
          <p className="min-w-56 flex-1 text-sm text-muted">
            <strong className="text-ink">Mutual swaps are free and unlimited.</strong> You teach them, they teach you. No credits touched.
          </p>
          <span className="inline-flex items-center rounded-sm bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">Free swap</span>
        </div>

        {/* Two equal columns with the arrow centred in the gap, so the cards share the column lines of the section below. */}
        <div className="relative mt-5 grid items-stretch gap-4 lg:grid-cols-2 lg:gap-x-12">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4.5">
            <div className="flex items-center justify-between gap-3 max-sm:flex-wrap sm:flex-nowrap">
              <span className="flex min-w-0 items-center gap-3">
                <SwapPair me={{ name: 'You', avatarUrl: null }} partner={{ name: 'Priya', avatarUrl: null }} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">You teach Priya public speaking</span>
                  <span className="block text-[0.8125rem] text-muted">An hour of your skill, taught to anyone who wants it</span>
                </span>
              </span>
              <span className="figures font-display text-2xl font-semibold whitespace-nowrap text-success">+1 credit</span>
            </div>
            <p className="text-[0.8125rem] text-muted">Every taught hour earns one Swap Credit. Finishing onboarding starts you with one, free.</p>
          </div>

          <span aria-hidden="true" className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-faint lg:block">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4.5">
            <div className="flex items-center justify-between gap-3 max-sm:flex-wrap sm:flex-nowrap">
              <span className="flex min-w-0 items-center gap-3">
                <SwapPair me={{ name: 'You', avatarUrl: null }} partner={{ name: 'Yuki', avatarUrl: null }} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">Yuki teaches you Japanese</span>
                  <span className="block text-[0.8125rem] text-muted">Any mentor, any skill. The match doesn’t have to be mutual</span>
                </span>
              </span>
              <span className="figures font-display text-2xl font-semibold whitespace-nowrap text-ink">−1 credit</span>
            </div>
            <p className="text-[0.8125rem] text-muted">A credit books a one-hour session with any teacher on the platform.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
