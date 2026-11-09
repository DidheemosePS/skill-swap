import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { Wallet } from '../../types'
import StatCard from '../cards/StatCard'
import AlertBanner from '../common/AlertBanner'
import Skeleton from '../common/Skeleton'

interface CreditSummaryCardProps {
  wallet: Wallet | null
  status: AsyncStatus
  onRetry: () => void
}

export default function CreditSummaryCard({ wallet, status, onRetry }: CreditSummaryCardProps) {
  return (
    <section aria-labelledby="wallet-heading" className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="wallet-heading" className="font-semibold">Wallet</h2>
        <Link to="/wallet" className="rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
          View ledger
        </Link>
      </div>
      <div className="mt-4">
        {status === 'loading' && (
          <div role="status" aria-label="Loading wallet">
            <Skeleton className="h-36" />
          </div>
        )}
        {status === 'error' && <AlertBanner message="We couldn't load your wallet." onRetry={onRetry} />}
        {status === 'ready' && wallet && (
          <dl className="grid grid-cols-2 gap-2">
            <StatCard label="Available" value={String(wallet.credits)} />
            <StatCard label="In escrow" value={String(wallet.escrowCredits)} />
            <StatCard label="Hours taught" value={String(wallet.hoursTaught)} />
            <StatCard label="Hours learned" value={String(wallet.hoursLearned)} />
          </dl>
        )}
      </div>
    </section>
  )
}
