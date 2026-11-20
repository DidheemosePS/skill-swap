import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { Wallet } from '../../types'
import AlertBanner from '../common/AlertBanner'
import Skeleton from '../common/Skeleton'

interface BoardTimeStampProps {
  wallet: Wallet | null
  status: AsyncStatus
  onRetry: () => void
  className?: string
}

// The balance as the board's stamped card: a dashed ultramarine frame, the credits large, the rest in words.
export default function BoardTimeStamp({ wallet, status, onRetry, className = '' }: BoardTimeStampProps) {
  return (
    <section aria-labelledby="your-time-heading" className={`flex flex-col rounded-2xl border-2 border-dashed border-accent bg-surface p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="your-time-heading" className="font-display text-lg font-semibold">Your time</h2>
        <Link to="/wallet" className="inline-flex min-h-9 items-center rounded text-sm font-semibold text-accent underline underline-offset-2 outline-none hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent">Wallet</Link>
      </div>
      {status === 'loading' && !wallet && <div role="status" aria-label="Loading wallet" className="mt-4 space-y-3"><Skeleton className="h-14 w-16" /><Skeleton className="h-4 w-32" /></div>}
      {status === 'error' && <div className="mt-4"><AlertBanner tone="inset" message="We couldn't load your wallet." onRetry={onRetry} /></div>}
      {status !== 'error' && wallet && (
        <div className="mt-3">
          {/* Stamped as one sentence in the display face, the way a swap board's stamp reads, not a big-number tile. */}
          <p className="font-display text-3xl leading-tight font-bold text-accent">
            <span className="figures">{wallet.credits}</span> {wallet.credits === 1 ? 'credit' : 'credits'} to spend
          </p>
          <p className="figures mt-3 text-sm text-ink">
            <b className={`font-semibold ${wallet.escrowCredits > 0 ? 'text-held' : ''}`}>{wallet.escrowCredits} held</b> for booked sessions.
            {' '}You've taught <b className="font-semibold">{wallet.hoursTaught} h</b> and learned <b className="font-semibold">{wallet.hoursLearned} h</b>.
          </p>
        </div>
      )}
    </section>
  )
}
