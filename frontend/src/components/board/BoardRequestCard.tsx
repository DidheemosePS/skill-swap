import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNow } from '../../hooks/useNow'
import { useToast } from '../../hooks/useToast'
import { acceptSwapRequest, isSlotAcceptable, RequestClosedError } from '../../services/swapRequestActions'
import { SlotTakenError } from '../../services/swapRequestService'
import type { MatchRecommendation } from '../../types'
import { formatSlotDateTime, formatSlotTime } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import Button from '../common/Button'

interface BoardRequestCardProps {
  match: MatchRecommendation
  line: string
  isPrimary: boolean
  onOpen: (match: MatchRecommendation) => void
  onDone: (message: string) => void
  className?: string
}

const weekday = (iso: string) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(iso))
const longDate = (iso: string) => new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))

// A request as a swap-board card: the proposed times hang off the bottom as tear-off tabs. Taking a tab tears it
// off and asks once before booking, because accepting books a real session; Put back returns it. Declining and
// countering stay in the full request ("More options").
export default function BoardRequestCard({ match, line, isPrimary, onOpen, onDone, className = '' }: BoardRequestCardProps) {
  const now = useNow(30_000)
  const toast = useToast()
  const [taken, setTaken] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const request = match.pendingRequest
  const firstName = match.peer.name.split(' ')[0]
  // Times inside the hour-before cutoff can't be accepted any more, so they aren't offered.
  const slots = (request?.proposedSlots ?? []).filter((slot) => isSlotAcceptable(slot, now))

  async function book() {
    if (!request || !taken) return
    setIsSending(true)
    try {
      await acceptSwapRequest(request.id, taken)
      onDone(`Accepted. Your session with ${firstName} is booked for ${formatSlotDateTime(taken)}.`)
    } catch (cause) {
      toast.error(
        cause instanceof SlotTakenError
          ? 'That time is no longer free. Take another tab, or suggest new times in Messages.'
          : cause instanceof RequestClosedError
            ? 'This request has already closed or changed. Open it in Messages.'
            : "We couldn't save that. Please try again.",
      )
      setIsSending(false)
      setTaken(null)
    }
  }

  return (
    <article className={`flex flex-col rounded-2xl bg-coral-soft ${taken ? 'mb-4' : ''} ${className}`}>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start gap-3">
          <Avatar name={match.peer.name} url={match.peer.avatarUrl} size="sm" />
          <h3 className="font-display text-lg leading-snug font-semibold text-pretty">
            <Link to={`/user/${match.peer.id}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{match.peer.name}</Link>{' '}
            <span className="font-medium">{line.charAt(0).toLowerCase() + line.slice(1)}</span>
          </h3>
        </div>
        <p className="text-sm text-muted">{taken ? <>Book <b className="font-semibold text-ink">{longDate(taken)}, {formatSlotTime(taken)}</b> with {firstName}?</> : slots.length > 0 ? 'Take a tab to accept that time.' : 'None of these times can be accepted now.'}</p>
        {taken ? (
          <div className="mt-1 flex flex-wrap gap-2">
            <Button variant={isPrimary ? 'primary' : 'secondary'} onClick={book} isLoading={isSending} autoFocus>Book</Button>
            <Button variant="secondary" onClick={() => setTaken(null)} disabled={isSending}>Put back</Button>
          </div>
        ) : (
          <button type="button" onClick={() => onOpen(match)} className="mt-1 self-start rounded text-sm font-semibold text-accent underline underline-offset-2 outline-none hover:text-accent-strong focus-visible:ring-2 focus-visible:ring-accent">
            More options<span className="sr-only"> for {firstName}'s request</span>
          </button>
        )}
      </div>
      {slots.length > 0 && (
        // The notches: two half-circles of the board's ground cut into the card at each end of the perforation.
        // Each time is its own stub, separated by a cut, so the strip reads as tabs to tear rather than a footer.
        <ul aria-label="Proposed times" className="relative flex gap-1.5 border-t-2 border-dashed border-coral/70 px-3 pt-3 pb-3 before:absolute before:-top-3 before:-left-3 before:size-6 before:rounded-full before:bg-shell after:absolute after:-top-3 after:-right-3 after:size-6 after:rounded-full after:bg-shell">
          {slots.map((slot) => {
            const isTaken = slot === taken
            return (
              <li key={slot} className="flex-1">
                <button
                  type="button"
                  aria-pressed={isTaken}
                  disabled={taken !== null && !isTaken}
                  onClick={() => setTaken(slot)}
                  className={`figures flex min-h-16 w-full flex-col items-center justify-center rounded-md border border-coral/40 bg-white px-2 py-2.5 shadow-[0_2px_3px_rgb(255_106_61/0.3)] text-center outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset disabled:opacity-40 ${isTaken ? 'tab-torn' : ''}`}
                >
                  <span className="text-xs font-medium text-muted">{weekday(slot)}</span>
                  <span className="font-display text-xl leading-tight font-bold">{new Date(slot).getDate()}</span>
                  <span className="text-xs font-medium">{formatSlotTime(slot)}</span>
                  <span className="sr-only"> take this time</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
