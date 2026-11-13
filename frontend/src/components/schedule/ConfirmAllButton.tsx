import { useState } from 'react'
import type { SessionToSettle } from '../../hooks/useDashboard'
import { completeSession } from '../../services/sessionActions'
import { useToast } from '../../hooks/useToast'

interface ConfirmAllButtonProps {
  // Only sessions the teacher already marked complete: confirming those is the member agreeing, not judging attendance.
  items: SessionToSettle[]
  onDone: (message: string) => void
}

// One click for several confirmations. Sessions that still need an outcome stay one at a time,
// because each needs its own meeting record read.
export default function ConfirmAllButton({ items, onDone }: ConfirmAllButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const toast = useToast()
  // Releasing several held credits can't be undone, so it asks once, like Decline and Withdraw.
  const [isConfirming, setIsConfirming] = useState(false)

  async function confirmAll() {
    setIsSending(true)
    const results = await Promise.allSettled(items.map(({ session }) => completeSession(session.id)))
    const failures = results.filter((result) => result.status === 'rejected').length
    if (failures > 0) toast.error(`${failures} ${failures === 1 ? 'session' : 'sessions'} couldn't be confirmed. Please try again.`)
    setIsSending(false)
    setIsConfirming(false)
    const confirmed = items.length - failures
    onDone(`Confirmed ${confirmed} ${confirmed === 1 ? 'session' : 'sessions'}. The held credits went to the teachers.`)
  }

  const linkClasses =
    'inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent disabled:text-muted'

  if (isConfirming) {
    return (
      <span className="flex flex-wrap items-center justify-end gap-x-3">
        <span className="text-sm">Release <span className="figures">{items.length}</span> held credits to their teachers?</span>
        <button type="button" onClick={confirmAll} disabled={isSending} className={linkClasses}>
          {isSending ? 'Confirming…' : 'Yes, confirm all'}
        </button>
        <button type="button" onClick={() => setIsConfirming(false)} disabled={isSending} className={`${linkClasses} text-muted`}>
          Keep
        </button>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-2">
      <button type="button" onClick={() => setIsConfirming(true)} className={linkClasses}>
        Confirm all <span className="figures ml-1">{items.length}</span>
      </button>
    </span>
  )
}
