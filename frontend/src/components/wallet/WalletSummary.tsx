import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { Wallet } from '../../types'
import AlertBanner from '../common/AlertBanner'
import { BalanceCardSkeleton } from '../common/skeletons'
import HoursBar from './HoursBar'

interface WalletSummaryProps {
  wallet: Wallet | null
  status: AsyncStatus
  onRetry: () => void
  // Replays the welcome tour, which is where the rules live now.
  onReplayTour: () => void
}

// How credits work, in one line, with the tour a tap away. Static, so it shows while the balance loads too;
// without onReplayTour (the reload screen) the link is drawn but inert.
export function CreditRules({ onReplayTour }: { onReplayTour?: () => void }) {
  const link = 'mt-2 inline-flex min-h-11 items-center rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent lg:min-h-9'
  return (
    <section aria-labelledby="rules-heading" className="rounded-2xl border border-line bg-card p-5">
      <h2 id="rules-heading" className="text-base font-semibold text-ink">How credits work</h2>
      <p className="mt-1 text-sm text-muted">Teach an hour, earn 1. Spend 1 to learn from anyone. Free swaps move nothing.</p>
      {onReplayTour ? <button type="button" onClick={onReplayTour} className={link}>Replay the tour</button> : <span aria-hidden="true" className={link}>Replay the tour</span>}
    </section>
  )
}

// The balance as the page's one dark card, then the rules in one line with the tour a tap away.
export default function WalletSummary({ wallet, status, onRetry, onReplayTour }: WalletSummaryProps) {
  if (status === 'error' && wallet === null) return <div className="grid gap-5"><AlertBanner message="We couldn't load your balance." onRetry={onRetry} /><CreditRules onReplayTour={onReplayTour} /></div>

  return (
    <div className="grid gap-5">
      {wallet === null ? (
        <div role="status" aria-label="Loading balance"><BalanceCardSkeleton /></div>
      ) : (
        <section aria-labelledby="balance-heading" className="rounded-3xl bg-next p-6 text-white sm:p-7">
          <h2 id="balance-heading" className="font-sans text-sm font-normal tracking-normal text-white/70">Credits to spend</h2>
          <p className="figures mt-1 font-display text-6xl leading-none font-semibold tracking-tight">{wallet.credits}</p>
          <p className="mt-4 text-white/75"><b className="figures font-semibold text-white">{wallet.escrowCredits}</b> held for booked sessions</p>
          <HoursBar taught={wallet.hoursTaught} learned={wallet.hoursLearned} onDark className="mt-6" />
        </section>
      )}
      <CreditRules onReplayTour={onReplayTour} />
    </div>
  )
}
