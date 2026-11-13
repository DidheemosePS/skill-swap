import { useEffect, useRef, useState } from 'react'
import { useCurrentUser } from '../../hooks/useAuth'
import { acceptSwapRequest, cancelSwapRequest, declineSwapRequest, isSlotAcceptable, RequestClosedError } from '../../services/swapRequestActions'
import { SlotTakenError } from '../../services/swapRequestService'
import type { Message, SwapRequest } from '../../types'
import { formatSlotDateTime, formatSlotTime, getSlotEnd } from '../../utils/timeSlots'
import Button from '../common/Button'
import { useToast } from '../../hooks/useToast'

interface SwapRequestActionsProps {
  request: SwapRequest
  isMyTurn: boolean
  peerFirstName: string
  // White on the plum note when it's the member's move; ink on the paper note otherwise.
  onPlum: boolean
  onUpdated: (message: Message) => void
  onCounter: () => void
}

function getActionError(cause: unknown) {
  if (cause instanceof RequestClosedError) return 'This request has already been answered or has expired.'
  if (cause instanceof SlotTakenError) return 'That time is no longer available, or clashes with one of your sessions.'
  return "We couldn't update this request. Please try again."
}

// Pick one of their times and Accept, suggest others, or close it. Closing can't be undone, so it takes a
// second, explicit click that says what happens to the times and any credit.
export default function SwapRequestActions({ request, isMyTurn, peerFirstName, onPlum, onUpdated, onCounter }: SwapRequestActionsProps) {
  const { id: myId } = useCurrentUser()
  const [now] = useState(() => Date.now())
  const acceptable = request.proposedSlots.filter((slot) => isSlotAcceptable(slot, now))
  const [chosen, setChosen] = useState(acceptable[0] ?? '')
  const [pendingAction, setPendingAction] = useState<'accept' | 'close' | null>(null)
  const [isConfirmingClose, setIsConfirmingClose] = useState(false)
  const toast = useToast()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)

  // "Keep it" removes the button that was focused, so focus goes back to the one that asked.
  useEffect(() => {
    if (!isConfirmingClose && returnFocus.current) {
      returnFocus.current = false
      closeButtonRef.current?.focus()
    }
  }, [isConfirmingClose])

  async function run(action: 'accept' | 'close', request_: () => Promise<Message>) {
    setPendingAction(action)
    try {
      onUpdated(await request_())
    } catch (cause) {
      toast.error(getActionError(cause))
      setPendingAction(null)
    }
  }

  const accept = () => run('accept', () => acceptSwapRequest(request.id, chosen))
  const close = () => run('close', () => (isMyTurn ? declineSwapRequest(request.id) : cancelSwapRequest(request.id)))
  const isBusy = pendingAction !== null
  const closeLabel = isMyTurn ? 'Decline' : 'Withdraw request'
  // Whoever paid gets the credit back: the member themselves, or the other member.
  const creditNote = request.swapType === 'two_way' ? '' : request.learnerId === myId ? ' Your credit comes back.' : ` ${peerFirstName}'s credit goes back to them.`

  const ink = onPlum ? 'text-white' : 'text-ink'
  const chip = onPlum ? 'border-white/50 text-white has-checked:border-white has-checked:bg-white/12' : 'border-line text-ink has-checked:border-next has-checked:bg-next-soft'
  const quiet = `inline-flex min-h-11 items-center rounded px-1 text-sm font-semibold underline underline-offset-3 outline-none disabled:opacity-60 ${onPlum ? 'text-white focus-visible:ring-2 focus-visible:ring-white' : 'text-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-accent'}`
  const outline = `inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold outline-none disabled:opacity-60 ${onPlum ? 'border-white/70 text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white' : 'border-line text-ink hover:border-muted hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent'}`

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className={`mb-2 text-xs font-semibold ${onPlum ? '' : 'text-muted'}`}>{isMyTurn ? `Pick one of ${peerFirstName}'s times` : 'Times you proposed'}</legend>
        <div className="flex flex-wrap gap-2">
          {request.proposedSlots.map((slot) => {
            const time = <span className="figures">{formatSlotDateTime(slot)}–{formatSlotTime(getSlotEnd(slot))}</span>
            return isMyTurn ? (
              <label key={slot} className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border px-3 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-60 ${chip}`}>
                <input type="radio" name={`time-${request.id}`} checked={chosen === slot} disabled={!acceptable.includes(slot)} onChange={() => setChosen(slot)} className={`size-4 ${onPlum ? 'accent-white' : 'accent-accent'}`} />
                {time}
              </label>
            ) : (
              <span key={slot} className={`flex min-h-11 items-center rounded-md border px-3 text-sm ${chip}`}>{time}</span>
            )
          })}
        </div>
      </fieldset>

      {isConfirmingClose ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className={`w-full text-sm font-medium ${ink}`}>{isMyTurn ? `Decline ${peerFirstName}'s request?` : 'Withdraw your request?'} Its times open up for others.{creditNote}</p>
          {/* An outline, not the note's fill: closing is never the next step the page is pointing at. */}
          <button type="button" autoFocus onClick={close} disabled={isBusy} className={outline}>{pendingAction === 'close' ? 'Working…' : `Yes, ${closeLabel.toLowerCase()}`}</button>
          <button type="button" onClick={() => { returnFocus.current = true; setIsConfirmingClose(false) }} disabled={isBusy} className={quiet}>Keep it</button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {isMyTurn && (
            <>
              <Button variant={onPlum ? 'onNext' : 'primary'} onClick={accept} disabled={!chosen || isBusy} isLoading={pendingAction === 'accept'}>Accept</Button>
              <button type="button" onClick={onCounter} disabled={isBusy} className={outline}>Suggest other times</button>
            </>
          )}
          <button ref={closeButtonRef} type="button" onClick={() => setIsConfirmingClose(true)} disabled={isBusy} className={quiet}>{closeLabel}</button>
        </div>
      )}
    </div>
  )
}
