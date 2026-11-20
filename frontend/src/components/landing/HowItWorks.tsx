import Avatar from '../common/Avatar'
import SwapPair from '../common/SwapPair'

const vigTag = 'w-[4.625rem] shrink-0 text-[0.6875rem] font-semibold tracking-wider text-faint uppercase'
const vigChip = 'rounded-md border border-line bg-surface px-2.5 py-1 text-[0.8125rem] font-medium text-ink'
const vigChipDark = 'rounded-md bg-next px-2.5 py-1 text-[0.8125rem] font-medium text-white'

// The three steps between "I know this" and a booked hour, each shown as the product
// in miniature (profile chips, a swap request, the dark session card) instead of icons.
// Vignettes are decorative previews, so they are aria-hidden; the step copy carries it.
export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-14 lg:py-18">
      <h2 className="font-display text-3xl font-semibold text-balance text-ink sm:text-4xl">How a swap happens</h2>
      <p className="mt-2.5 max-w-xl text-muted">Three steps between “I know this” and a booked hour on your calendar.</p>

      {/* Two columns on tablets, so the profile mock's chips keep their rows; three from lg. */}
      <div className="mt-9 grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col">
          <div className="flex items-baseline gap-3">
            <span aria-hidden="true" className="figures font-display text-2xl font-semibold text-faint">1</span>
            <h3 className="font-display text-lg font-semibold text-ink">Say what you trade</h3>
          </div>
          <p className="mt-2 text-sm text-muted">Skills you teach, skills you want, and the hours you’re free each week. That’s your whole profile.</p>
          <div aria-hidden="true" className="mt-4 flex flex-1 flex-col gap-2.5 rounded-2xl border border-line bg-card p-4">
            <div className="flex flex-wrap items-center gap-2"><span className={vigTag}>You teach</span><span className={vigChipDark}>Python</span><span className={vigChipDark}>Excel</span></div>
            <div className="flex flex-wrap items-center gap-2"><span className={vigTag}>You want</span><span className={vigChip}>Spanish</span><span className={vigChip}>Guitar</span></div>
            <div className="flex flex-wrap items-center gap-2"><span className={vigTag}>Free on</span><span className={`${vigChip} text-muted`}>Mon</span><span className={`${vigChip} text-muted`}>Wed</span><span className={`${vigChip} text-muted`}>Sat</span></div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-baseline gap-3">
            <span aria-hidden="true" className="figures font-display text-2xl font-semibold text-faint">2</span>
            <h3 className="font-display text-lg font-semibold text-ink">Agree a time in chat</h3>
          </div>
          <p className="mt-2 text-sm text-muted">A request proposes times from the other person’s week. Accept, suggest other times, or decline, right in the thread.</p>
          <div aria-hidden="true" className="mt-4 flex flex-1 flex-col gap-2.5 rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center gap-2.5">
              <Avatar name="Bea" url={null} size="xs" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">Bea · swap request</span>
                <span className="block text-xs text-muted">Her Spanish for your Python</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="figures rounded-md bg-next px-2.5 py-1.5 text-[0.8125rem] font-semibold text-white">Thu 18:00</span>
              <span className="figures rounded-md border border-line bg-surface px-2.5 py-1.5 text-[0.8125rem] text-ink">Fri 17:00</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-next px-3.5 py-2 text-[0.8125rem] font-semibold text-white">Accept</span>
              <span className="text-[0.8125rem] font-medium text-muted underline underline-offset-2">Suggest other times</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col md:col-span-2 lg:col-span-1">
          <div className="flex items-baseline gap-3">
            <span aria-hidden="true" className="figures font-display text-2xl font-semibold text-faint">3</span>
            <h3 className="font-display text-lg font-semibold text-ink">Meet for one hour</h3>
          </div>
          <p className="mt-2 text-sm text-muted">One hour, online, with a meeting link made for you. Afterwards, both sides rate how it went.</p>
          <div aria-hidden="true" className="mt-4 flex flex-1 flex-col justify-center gap-2.5 rounded-2xl bg-next p-4 text-white">
            <SwapPair me={{ name: 'You', avatarUrl: null }} partner={{ name: 'Bea', avatarUrl: null }} size="sm" ringClass="ring-next" />
            <span className="font-display text-base font-semibold">Spanish with Bea</span>
            <span className="figures text-[0.8125rem] text-white/70">Today 18:00–19:00 · starts in 8 min</span>
            <span className="self-start rounded-lg bg-white px-3.5 py-2 text-[0.8125rem] font-semibold text-ink">Join meeting</span>
          </div>
        </div>
      </div>
    </section>
  )
}
