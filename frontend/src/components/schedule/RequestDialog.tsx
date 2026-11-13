import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNow } from '../../hooks/useNow'
import { acceptSwapRequest, cancelSwapRequest, declineSwapRequest, isSlotAcceptable, RequestClosedError } from '../../services/swapRequestActions'
import { SlotTakenError } from '../../services/swapRequestService'
import type { MatchRecommendation } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { useToast } from '../../hooks/useToast'

interface RequestDialogProps {
  match: MatchRecommendation
  onClose: () => void
  // Called after accept, decline or withdraw with what happened, so the page reloads and says so.
  onDone: (message: string) => void
}

const quietClasses =
  'inline-flex min-h-11 items-center rounded px-1 text-sm font-semibold text-muted outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-accent sm:mr-auto'

// Everything about one pending request in one place, so the inbox row needs only a single verb.
// A request to the member is answered here (pick a time, or decline); one they sent can be withdrawn here.
export default function RequestDialog({ match, onClose, onDone }: RequestDialogProps) {
  const firstName = match.peer.name.split(' ')[0]
  const request = match.pendingRequest
  const skill = request?.skillName ?? null
  // Whoever proposed the current times can withdraw; the other member answers.
  const canAnswer = request?.awaitingMe ?? false
  const now = useNow(30_000)
  // Times inside the hour-before cutoff can't be accepted any more, so they aren't offered.
  const slots = (request?.proposedSlots ?? []).filter((slot) => !canAnswer || isSlotAcceptable(slot, now))
  const [picked, setPicked] = useState<string | null>(canAnswer && slots.length === 1 ? slots[0] : null)
  const [isClosing, setIsClosing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const toast = useToast()

  const closeWord = canAnswer ? 'Decline' : 'Withdraw'
  const creditNote = match.creditCost === 0 ? 'No credits are involved.' : canAnswer ? `${firstName}'s credit goes back to them.` : 'Your credit comes back.'

  async function run(action: 'accept' | 'close') {
    if (!request) return
    setIsSending(true)
    try {
      if (action === 'accept' && picked) {
        await acceptSwapRequest(request.id, picked)
        onDone(`Accepted. Your session with ${firstName} is booked for ${formatSlotDateTime(picked)}.`)
      } else {
        await (canAnswer ? declineSwapRequest(request.id) : cancelSwapRequest(request.id))
        onDone(canAnswer ? `Declined ${firstName}'s request. ${creditNote}` : `Withdrew your request to ${firstName}. ${creditNote}`)
      }
    } catch (cause) {
      toast.error(
        cause instanceof SlotTakenError
          ? 'That time is no longer free. Pick another, or suggest new times in Messages.'
          : cause instanceof RequestClosedError
            ? 'This request has already closed or changed. Open it in Messages.'
            : "We couldn't save that. Please try again.",
      )
      setIsSending(false)
      setIsClosing(false)
    }
  }

  const footer = isClosing ? (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <p className="text-sm font-medium sm:mr-auto">{closeWord} {canAnswer ? `${firstName}'s request` : 'your request'}? {creditNote}</p>
      <Button variant="secondary" onClick={() => setIsClosing(false)} disabled={isSending}>Go back</Button>
      {/* The button that asked is gone, so focus moves to the choice instead of dropping to the page. */}
      <Button autoFocus onClick={() => run('close')} isLoading={isSending}>Yes, {closeWord.toLowerCase()}</Button>
    </div>
  ) : (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      {request && <button type="button" onClick={() => setIsClosing(true)} disabled={isSending} className={quietClasses}>{closeWord} request</button>}
      {canAnswer ? (
        <>
          {/* A disabled button can't explain itself, so the missing step is named beside it. */}
          {!picked && slots.length > 0 && <p className="text-sm text-muted">Pick a time to accept.</p>}
          <Button variant="secondary" onClick={onClose} disabled={isSending}>Cancel</Button>
          <Button onClick={() => run('accept')} disabled={!picked} isLoading={isSending}>Accept</Button>
        </>
      ) : (
        <Button variant="secondary" onClick={onClose}>Close</Button>
      )}
    </div>
  )

  return (
    <Modal title={canAnswer ? `${firstName}'s request` : `Your request to ${firstName}`} onClose={onClose} isLocked={isSending} footer={footer}>
      {/* Who teaches what comes first: it's the thing being agreed to. */}
      <p className="mt-2 font-semibold">
        {match.creditCost === 0
          ? `A free swap: you teach each other for an hour${skill ? `, starting with ${skill}` : ''}.`
          : canAnswer
            ? `You'd teach ${firstName} ${skill ?? 'for an hour'}.`
            : `You'd learn ${skill ?? 'for an hour'} from ${firstName}.`}
      </p>
      <p className="mt-1 text-sm text-muted">
        {match.creditCost === 0
          ? 'No credits move.'
          : canAnswer
            ? `${firstName} has put 1 credit on hold for this. It's yours once the session is complete.`
            : `Your 1 credit is held until ${firstName} replies. It comes back if they decline or the request expires.`}
      </p>

      {canAnswer && slots.length === 0 && <p className="mt-4 text-sm">None of the proposed times can still be booked. Suggest new times in Messages.</p>}
      {canAnswer && slots.length > 0 && (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Pick one of {firstName}'s times</legend>
          <div className="mt-2 space-y-2">
            {slots.map((slot) => (
              <label key={slot} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-line px-3 has-checked:border-next has-checked:bg-next-soft">
                <input type="radio" name="accept-slot" value={slot} checked={picked === slot} onChange={() => setPicked(slot)} className="accent-accent" />
                <span className="figures text-sm font-medium">{formatSlotDateTime(slot)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!canAnswer && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Times you proposed</p>
          <ul className="mt-2 divide-y divide-line/60 rounded-md border border-line px-3">
            {slots.map((slot) => <li key={slot} className="figures py-2.5 text-sm font-medium">{formatSlotDateTime(slot)}</li>)}
          </ul>
          <Link to={`/messages?peer=${match.peer.id}`} className="mt-3 inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
            Open the chat with {firstName}
          </Link>
        </div>
      )}
    </Modal>
  )
}
