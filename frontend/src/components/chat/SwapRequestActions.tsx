import { useState } from 'react'
import { acceptSwapRequest, cancelSwapRequest, declineSwapRequest, isSlotAcceptable, RequestClosedError } from '../../services/swapRequestActions'
import { SlotTakenError } from '../../services/swapRequestService'
import type { Message, SwapRequest } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'

interface SwapRequestActionsProps {
  request: SwapRequest
  isMyTurn: boolean
  peerFirstName: string
  onUpdated: (message: Message) => void
  onCounter: () => void
}

function getActionError(cause: unknown) {
  if (cause instanceof RequestClosedError) return 'This request has already been answered or has expired.'
  if (cause instanceof SlotTakenError) return "That time is no longer available, or clashes with one of your sessions."
  return "We couldn't update this request. Please try again."
}

export default function SwapRequestActions({ request, isMyTurn, peerFirstName, onUpdated, onCounter }: SwapRequestActionsProps) {
  const [now] = useState(() => Date.now())
  const acceptable = request.proposedSlots.filter((slot) => isSlotAcceptable(slot, now))
  const [chosen, setChosen] = useState(acceptable[0] ?? '')
  const [pendingAction, setPendingAction] = useState<'accept' | 'close' | null>(null)
  // Declining or cancelling can't be undone, so it takes a second, explicit click.
  const [isConfirmingClose, setIsConfirmingClose] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: 'accept' | 'close', request_: () => Promise<Message>) {
    setPendingAction(action)
    setError(null)
    try {
      onUpdated(await request_())
    } catch (cause) {
      setError(getActionError(cause))
    } finally {
      setPendingAction(null)
    }
  }

  const accept = () => run('accept', () => acceptSwapRequest(request.id, chosen))
  const close = () => run('close', () => (isMyTurn ? declineSwapRequest(request.id) : cancelSwapRequest(request.id)))
  const isBusy = pendingAction !== null
  const closeLabel = isMyTurn ? 'Decline' : 'Cancel request'

  return (
    <div className="mt-3 space-y-3">
      {isMyTurn && (
        <fieldset>
          <legend className="text-xs font-semibold text-muted">Choose a time</legend>
          <div className="mt-2 space-y-1">
            {request.proposedSlots.map((slot) => (
              <label key={slot} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:text-muted">
                <input
                  type="radio"
                  name={`time-${request.id}`}
                  checked={chosen === slot}
                  disabled={!acceptable.includes(slot)}
                  onChange={() => setChosen(slot)}
                  className="size-4 accent-accent"
                />
                {formatSlotDateTime(slot)}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!isMyTurn && <p className="text-sm text-muted">Waiting for {peerFirstName} to respond.</p>}
      {error && <AlertBanner message={error} />}

      {isConfirmingClose ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="w-full text-sm font-medium">{closeLabel} this swap? Its times will open up for others.</p>
          <Button onClick={close} isLoading={pendingAction === 'close'}>Yes, {closeLabel.toLowerCase()}</Button>
          <Button variant="secondary" onClick={() => setIsConfirmingClose(false)} disabled={isBusy}>Keep it</Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {isMyTurn && (
            <>
              <Button onClick={accept} disabled={!chosen || isBusy} isLoading={pendingAction === 'accept'}>Accept</Button>
              <Button variant="secondary" onClick={onCounter} disabled={isBusy}>Counter</Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setIsConfirmingClose(true)} disabled={isBusy}>{closeLabel}</Button>
        </div>
      )}
    </div>
  )
}
