import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { Wallet } from '../../types'
import AlertBanner from '../common/AlertBanner'
import HoursBar from './HoursBar'
import { FiguresSkeleton } from '../common/skeletons'

interface CreditSummaryCardProps {
  wallet: Wallet | null
  status: AsyncStatus
  onRetry: () => void
}

// The balance as two figures and the hours behind them. How credits work is the tour's job, so nothing here
// explains; the Wallet page has the detail.
export default function CreditSummaryCard({ wallet, status, onRetry }: CreditSummaryCardProps) {
  return (
    <section aria-labelledby="your-time-heading" className="rounded-2xl bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="your-time-heading" className="text-lg font-semibold text-ink">Your time</h2>
        <Link to="/wallet" className="inline-flex min-h-9 items-center rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
          Wallet
        </Link>
      </div>
      {status === 'loading' && !wallet && <div role="status" aria-label="Loading wallet"><FiguresSkeleton /></div>}
      {status === 'error' && <div className="mt-4"><AlertBanner tone="inset" message="We couldn't load your wallet." onRetry={onRetry} /></div>}
      {status !== 'error' && wallet && (
        <>
          <dl className="mt-4 flex gap-8">
            <div className="flex flex-col-reverse">
              <dt className="mt-1.5 text-sm text-muted">credits to spend</dt>
              <dd className="figures font-display text-4xl leading-none font-semibold tracking-tight text-ink">{wallet.credits}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="mt-1.5 text-sm text-muted">held for sessions</dt>
              <dd className={`figures font-display text-4xl leading-none font-semibold tracking-tight ${wallet.escrowCredits > 0 ? 'text-held' : 'text-ink'}`}>{wallet.escrowCredits}</dd>
            </div>
          </dl>
          <HoursBar taught={wallet.hoursTaught} learned={wallet.hoursLearned} className="mt-5" />
        </>
      )}
    </section>
  )
}
