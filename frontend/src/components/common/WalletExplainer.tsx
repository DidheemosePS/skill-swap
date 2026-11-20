import { Link } from 'react-router-dom'
import { useAsyncData } from '../../hooks/useAsyncData'
import { fetchTransactions } from '../../services/walletService'
import type { LedgerEntry, SessionStatus } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Skeleton from './Skeleton'

interface WalletExplainerProps {
  id: string
  credits: number | null
  heldCredits: number | null
  hasFailed: boolean
  onRetry: () => void
  // Closes and hands focus back to the chip; also used after following a link.
  onClose: () => void
}

// Why each held credit is held, in the member's terms: what it's waiting for before it moves.
const HELD_UNTIL: Partial<Record<SessionStatus, string>> = {
  pending: 'until they accept a time',
  confirmed: "until it's taught",
  awaiting_settlement: 'until it settles, 24 hours after the end',
  disputed: 'while an admin reviews a concern',
}

// Fetched only when opened, so the navbar on every page doesn't load the ledger.
export default function WalletExplainer({ id, credits, heldCredits, hasFailed, onRetry, onClose }: WalletExplainerProps) {
  const ledger = useAsyncData(fetchTransactions)
  const held = (ledger.data ?? []).filter((entry): entry is LedgerEntry & { session: NonNullable<LedgerEntry['session']> } => entry.status === 'in_escrow' && entry.session !== null)

  return (
    // Sets its own ink: it opens inside the ultramarine bar, and data-popover keeps the bar's white focus rings out.
    <section id={id} data-popover aria-label="Credits" className="fixed inset-x-4 top-[4.25rem] z-30 rounded-2xl border border-line bg-surface p-5 text-sm text-ink shadow-[0_12px_28px_-8px_rgb(27_29_34/0.28)] md:absolute md:inset-x-auto md:top-auto md:right-0 md:mt-2 md:w-96">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Your credits</h2>
        {/* Phones have no Escape key, and the panel covers the page width, so it gets a visible close. */}
        <button type="button" onClick={onClose} className="-mt-2 -mr-2 inline-flex min-h-11 items-center rounded px-2 text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent md:hidden">Close</button>
      </div>
      <p className="text-muted">Teach an hour, earn 1.</p>
      {hasFailed && <p className="mt-2 text-danger">Your balance couldn't load. <button type="button" onClick={onRetry} className="font-semibold underline">Try again</button></p>}
      <dl className="mt-3 divide-y divide-line">
        {/* Stamped like the dashboard's hours card: the spendable balance as one line in the display face. */}
        <div className="flex items-center justify-between gap-4 pb-3">
          <dt className="font-display text-2xl leading-tight font-bold text-accent"><span className="figures">{credits ?? '–'}</span> to spend</dt>
          <dd className="shrink-0 text-right">
            <Link to="/explore" onClick={onClose} className="-mr-2 inline-flex min-h-11 items-center rounded px-2 font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">Find someone</Link>
          </dd>
        </div>
        {/* Held reasons stack under the figure: each is a short sentence, too long for a side column. */}
        <div className="py-3">
          <dt className="font-semibold text-held"><b className="figures font-semibold">{heldCredits ?? 0}</b> held</dt>
          <dd className="mt-0.5 text-muted">Set aside for bookings; returned if a session doesn't happen.</dd>
          <dd className="mt-1.5 text-muted">
            {(heldCredits ?? 0) === 0 && 'Nothing held.'}
            {(heldCredits ?? 0) > 0 && ledger.status === 'loading' && !ledger.data && <Skeleton className="h-4 w-48" />}
            {(heldCredits ?? 0) > 0 && ledger.status === 'error' && (
              <>Couldn't load. <button type="button" onClick={ledger.retry} className="font-semibold text-accent-strong hover:underline">Try again</button></>
            )}
            {held.length > 0 && (
              <ul className="space-y-1">
                {held.map((entry) => (
                  <li key={entry.id}>
                    <span className="text-ink">{entry.partner?.name.split(' ')[0] ?? 'Session'}</span> · <span className="figures">{formatSlotDateTime(entry.session.startsAt)}</span> · {HELD_UNTIL[entry.session.status] ?? 'held'}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </dl>
      <div className="flex justify-end border-t border-line pt-1">
        <Link to="/wallet" onClick={onClose} className="-mr-2 inline-flex min-h-11 items-center rounded px-2 font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
          Open wallet
        </Link>
      </div>
    </section>
  )
}
