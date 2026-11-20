import { getButtonClasses } from '../common/buttonStyles'
import type { SettleStep } from './SettlingDrawer'

interface SettlingActionsProps {
  // The member pressed Confirm now already; it waits on the partner or the clock.
  iConfirmed: boolean
  partnerFirstName: string
  onOpen: (step: SettleStep) => void
  isOpening?: boolean
}

// The two optional moves on a settling session, kept quiet: the credit moves on its own, so neither is a job.
export default function SettlingActions({ iConfirmed, partnerFirstName, onOpen, isOpening = false }: SettlingActionsProps) {
  const quiet = 'inline-flex min-h-11 items-center rounded text-sm font-medium text-muted underline underline-offset-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60'
  return (
    <div className="flex flex-wrap items-center gap-x-4">
      {iConfirmed ? (
        <p className="text-sm text-muted">You confirmed · waiting on {partnerFirstName}</p>
      ) : (
        <button type="button" onClick={() => onOpen('confirm')} disabled={isOpening} aria-busy={isOpening} className={getButtonClasses('secondary', 'lg:min-h-9 lg:px-4')}>
          Confirm now<span className="sr-only"> with {partnerFirstName}</span>
        </button>
      )}
      <button type="button" onClick={() => onOpen('concern')} disabled={isOpening} className={quiet}>Raise a concern<span className="sr-only"> about the session with {partnerFirstName}</span></button>
    </div>
  )
}
