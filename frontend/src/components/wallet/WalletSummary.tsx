import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { Wallet } from '../../types'
import AlertBanner from '../common/AlertBanner'
import Skeleton from '../common/Skeleton'
import { formatCredits } from './ledgerFilters'

interface WalletSummaryProps {
  wallet: Wallet | null
  status: AsyncStatus
  onRetry: () => void
}

function SummaryCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-surface p-5">
      <h3 className="text-sm text-muted">{label}</h3>
      {children}
    </div>
  )
}

export default function WalletSummary({ wallet, status, onRetry }: WalletSummaryProps) {
  if (wallet === null && status === 'loading') {
    return (
      <div role="status" aria-label="Loading wallet" className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    )
  }
  if (status === 'error' || wallet === null) return <AlertBanner message="We couldn't load your balance." onRetry={onRetry} />

  return (
    <section aria-labelledby="summary-heading" className="grid gap-4 sm:grid-cols-3">
      <h2 id="summary-heading" className="sr-only">Summary</h2>
      <SummaryCard label="Available balance">
        <p className="mt-2 text-3xl font-semibold tabular-nums"><span aria-hidden="true">⚡ </span>{formatCredits(wallet.credits)}</p>
        <p className="mt-auto pt-3 text-sm text-muted">Each credit books a 1-hour session with any mentor.</p>
      </SummaryCard>
      <SummaryCard label="Escrow hold">
        <p className="mt-2 text-3xl font-semibold tabular-nums"><span aria-hidden="true">🔒 </span>{formatCredits(wallet.escrowCredits)}</p>
        <p className="mt-auto pt-3 text-sm text-muted">
          Held for booked sessions until they're confirmed.{' '}
          {wallet.escrowCredits > 0 && (
            <Link to="?filter=escrow" className="rounded font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
              View holds
            </Link>
          )}
        </p>
      </SummaryCard>
      <SummaryCard label="Lifetime stats">
        <dl className="mt-2 grid grid-cols-2 gap-3">
          {/* The term comes first in the markup, as a description list needs; the number shows on top. */}
          <div className="flex flex-col-reverse">
            <dt className="text-sm text-muted">Hours taught</dt>
            <dd className="text-3xl font-semibold tabular-nums">{wallet.hoursTaught}h</dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="text-sm text-muted">Hours learned</dt>
            <dd className="text-3xl font-semibold tabular-nums">{wallet.hoursLearned}h</dd>
          </div>
        </dl>
      </SummaryCard>
    </section>
  )
}
