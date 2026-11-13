import { useCallback, useId, useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { useWallet } from '../../hooks/useWallet'
import Skeleton from './Skeleton'
import WalletExplainer from './WalletExplainer'

interface WalletChipProps {
  // Null while loading or after a failed load, so the chip never shows a wrong balance.
  credits: number | null
  heldCredits: number | null
}

// The balance as one printed chip, "2 credits | 2 held". Pressing it explains the two numbers in place,
// since first-time members didn't know what "held" meant, with the Wallet one link further.
export default function WalletChip({ credits, heldCredits }: WalletChipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // Loading and failure look different: a placeholder bar while it loads, and a plain word once it failed.
  const { status, refresh } = useWallet()
  const hasFailed = credits === null && status === 'error'
  const panelId = useId()
  const close = useCallback(() => setIsOpen(false), [])
  useDismiss(ref, isOpen, close, triggerRef)
  const creditWord = credits === 1 ? 'credit' : 'credits'

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        // Points at the panel only while it exists.
        aria-controls={isOpen ? panelId : undefined}
        aria-label={credits === null ? (hasFailed ? 'Wallet unavailable' : 'Loading your credits') : `Your credits: ${credits} to spend${heldCredits ? `, ${heldCredits} held` : ''}. What does this mean?`}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex min-h-11 items-center rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="figures inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-sm whitespace-nowrap transition-colors hover:bg-canvas">
          {credits === null ? (
            hasFailed ? <span className="font-semibold">Wallet unavailable</span> : <Skeleton className="h-4 w-24" />
          ) : (
            <>
              <span><b className="font-semibold">{credits}</b> {creditWord}</span>
              {heldCredits ? (
                <>
                  <span aria-hidden="true" className="h-4 w-px bg-line" />
                  <span className="font-semibold text-held"><b className="font-semibold">{heldCredits}</b> held</span>
                </>
              ) : null}
            </>
          )}
        </span>
      </button>
      {isOpen && <WalletExplainer id={panelId} credits={credits} heldCredits={heldCredits} hasFailed={hasFailed} onRetry={refresh} onClose={() => { close(); triggerRef.current?.focus() }} />}
    </div>
  )
}
