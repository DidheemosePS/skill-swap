import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import { useNow } from '../../hooks/useNow'
import type { ConversationSummary, Message, SwapRequest } from '../../types'
import { formatMessageTime } from '../../utils/chat'
import { formatCountdown, getJoinState } from '../../utils/sessions'
import { formatSlotDateTime, formatSlotTime, getSlotEnd } from '../../utils/timeSlots'
import { getButtonClasses } from '../common/buttonStyles'
import JoinMeetingButton from '../schedule/JoinMeetingButton'
import { describeDeal } from './describeDeal'
import PlumNote from './PlumNote'
import SettlingNote from './SettlingNote'
import type { SettleStep } from '../schedule/SettlingDrawer'
import SwapPair from '../common/SwapPair'
import SwapRequestActions from './SwapRequestActions'

interface PinnedRequestNoteProps {
  request: SwapRequest | null
  sentAt: string | null
  settling: ConversationSummary['settling']
  peerName: string
  peerAvatarUrl: string | null
  skillNames: Map<string, string>
  onUpdated: (message: Message) => void
  onCounter: (request: SwapRequest) => void
  // Opens the settle drawer for the settling session right here, as the dashboard does.
  onSettle: (step: SettleStep) => void
  isOpeningSettle: boolean
}

const SOON_MS = 60 * 60_000

// The live request or booked session with this person, pinned above the thread, with any settling session as a
// quiet row under it. Plum only when it's the member's move (reply, join); otherwise a one-row paper note that opens on demand,
// so waiting threads keep the screen for the conversation.
export default function PinnedRequestNote({ request, sentAt, settling, peerName, peerAvatarUrl, skillNames, onUpdated, onCounter, onSettle, isOpeningSettle }: PinnedRequestNoteProps) {
  const me = useCurrentUser()
  const myId = me.id
  const now = useNow(30_000)
  const [isOpen, setIsOpen] = useState(false)
  const firstName = peerName.split(' ')[0]
  // What makes this the member's move right now: a reply owed, or a booked session open or within the hour.
  const isPending = request?.status === 'pending'
  const isMyTurn = isPending && request?.lastProposedBy !== myId
  const session = request?.sessionId && request.confirmedStartsAt ? { id: request.sessionId, startsAt: request.confirmedStartsAt, durationMinutes: 60 as const, meetingUrl: request.meetingUrl } : null
  const msToStart = session ? Date.parse(session.startsAt) - now : Infinity
  const isJoinable = session !== null && getJoinState(session, now) === 'open'
  const isSoon = msToStart > 0 && msToStart <= SOON_MS
  const isYourMove = isMyTurn || isJoinable || isSoon
  const settlingNote = settling && <SettlingNote settling={settling} firstName={firstName} skillName={skillNames.get(settling.skillId) ?? 'a skill'} isOpening={isOpeningSettle} onOpen={onSettle} />
  if (!request) return settlingNote
  const deal = describeDeal(request, myId, firstName, skillNames)
  const label = isPending
    ? isMyTurn ? `${firstName}'s request · your turn to reply` : `Your request · ${firstName}'s turn to reply`
    : msToStart <= 0 ? 'Happening now' : isJoinable || isSoon ? `Starts in ${Math.ceil(msToStart / 60_000)} min` : 'Booked'

  const body = (
    <>
      {isPending && (
        <SwapRequestActions key={request.proposedSlots.join()} request={request} isMyTurn={isMyTurn} peerFirstName={firstName} onPlum={isYourMove} onUpdated={onUpdated} onCounter={() => onCounter(request)} />
      )}
      {request.status === 'confirmed' && session && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {isJoinable ? (
            <JoinMeetingButton session={session} now={now} variant="onNext" partnerName={firstName} />
          ) : (
            <Link to="/sessions" className={getButtonClasses(isYourMove ? 'onNext' : 'secondary')}>View in Sessions</Link>
          )}
          <p className="figures text-sm font-semibold">{formatSlotDateTime(session.startsAt)}–{formatSlotTime(getSlotEnd(session.startsAt))}</p>
          {/* The session's rules said in place, so Sessions is only needed to change it. */}
          {!isJoinable && <p className="w-full text-sm">Join opens 10 min before it starts. To cancel or offer new times, open it in Sessions.</p>}
        </div>
      )}
      {/* "Sent" names the moment of sending, shown only while the request is still open. */}
      {isPending && sentAt && (
        <p className="mt-3 text-xs">
          Sent <span className="figures">{formatMessageTime(sentAt, now)}</span>
          {request.expiresAt && <> · expires in <span className="figures">{formatCountdown(Date.parse(request.expiresAt) - now)}</span></>}
          {request.note && <> · “{request.note}”</>}
          {request.counterNote && <> · {request.lastProposedBy === myId ? 'Your' : `${firstName}'s`} note on these times: “{request.counterNote}”</>}
        </p>
      )}
    </>
  )

  if (isYourMove) {
    return (
      <>
        <PlumNote id={request.id} label={label} headline={deal.headline} sub={deal.creditLine} pair={<SwapPair me={me} partner={{ name: peerName, avatarUrl: peerAvatarUrl }} size="md" ringClass="ring-next" />}>
          {body}
        </PlumNote>
        {settlingNote}
      </>
    )
  }

  // Nothing to do right now: one paper row with the essentials, the rest behind Details.
  return (
    <>
      <section data-request-id={request.id} aria-label={`${label}: ${deal.headline}`} className="rounded-2xl border border-line bg-card px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          <p className="min-w-0 py-1 text-sm">
            <span className="text-xs font-semibold text-muted">{label}</span>
            <span className="mx-1.5 text-muted">·</span>
            <span className="font-semibold">{deal.headline}</span>
            {session && <span className="figures text-muted"> · {formatSlotDateTime(session.startsAt)}</span>}
            {/* The one rule a booked member needs before the day, visible without opening Details. */}
            {session && <span className="text-muted"> · Join opens 10 min before</span>}
          </p>
          <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="inline-flex min-h-11 items-center rounded px-1 text-sm font-semibold text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
            {isOpen ? 'Hide details' : 'Details'}
          </button>
        </div>
        {isOpen && (
          <div className="mt-1 mb-2 border-t border-line pt-3 text-sm">
            <p className="mb-3 text-muted">{deal.creditLine}</p>
            {body}
          </div>
        )}
      </section>
      {settlingNote}
    </>
  )
}
