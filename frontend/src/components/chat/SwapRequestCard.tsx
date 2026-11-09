import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import { logAttendance } from '../../services/sessionService'
import type { Message, SwapRequest, SwapRequestStatus } from '../../types'
import { formatCountdown, getJoinState } from '../../utils/sessions'
import { formatSlotDateTime } from '../../utils/timeSlots'
import AlertBanner from '../common/AlertBanner'
import { getButtonClasses } from '../common/buttonStyles'
import StatusPill from '../common/StatusPill'
import type { StatusTone } from '../common/StatusPill'
import SwapRequestActions from './SwapRequestActions'

interface SwapRequestCardProps {
  request: SwapRequest
  peerName: string
  skillNames: Map<string, string>
  timeLabel: string
  isHighlighted: boolean
  onUpdated: (message: Message) => void
  onCounter: (request: SwapRequest) => void
}

const STATUS_STYLES: Record<SwapRequestStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  expired: { label: 'Expired', tone: 'neutral' },
}

function RequestNote({ label, text }: { label: string; text: string }) {
  return (
    <blockquote className="mt-3 rounded-lg bg-canvas p-3 text-sm [overflow-wrap:anywhere]">
      <p className="mb-1 text-xs font-semibold text-muted">{label}</p>
      {text}
    </blockquote>
  )
}

export default function SwapRequestCard({ request, peerName, skillNames, timeLabel, isHighlighted, onUpdated, onCounter }: SwapRequestCardProps) {
  const { id: myId } = useCurrentUser()
  const [now] = useState(() => Date.now())
  const [hasAttendanceError, setHasAttendanceError] = useState(false)
  const peerFirstName = peerName.split(' ')[0]
  const nameOf = (id: string | null) => (id && skillNames.get(id)) || 'a skill'
  const iPaid = request.swapType === 'one_way' && request.learnerId === myId
  const isClosed = ['declined', 'cancelled', 'expired'].includes(request.status)
  const { label, tone } = STATUS_STYLES[request.status]

  const teachLine = request.teacherId === myId ? `You teach ${nameOf(request.skillId)}` : `${peerFirstName} teaches ${nameOf(request.skillId)}`
  const returnLine = request.returnSkillId && (request.teacherId === myId ? `${peerFirstName} teaches ${nameOf(request.returnSkillId)}` : `You teach ${nameOf(request.returnSkillId)}`)

  // Only a click inside the join window counts as attending; an early look at the link shouldn't.
  function recordJoin() {
    const startsAt = request.confirmedStartsAt
    if (!startsAt || !request.sessionId || getJoinState({ startsAt, durationMinutes: 60 }, Date.now()) !== 'open') return
    setHasAttendanceError(false)
    logAttendance(request.sessionId).catch(() => setHasAttendanceError(true))
  }

  return (
    <article
      data-request-id={request.id}
      className={`w-full max-w-md rounded-xl border bg-surface p-4 ${isHighlighted ? 'border-accent ring-2 ring-accent/25' : 'border-line'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Swap request</h3>
        <StatusPill label={label} tone={tone} />
      </div>
      <p className="mt-2 text-sm">{teachLine}{returnLine && `, ${returnLine.charAt(0).toLowerCase()}${returnLine.slice(1)}`}</p>
      <p className="mt-1 text-xs text-muted">
        {request.swapType === 'two_way' ? 'Free 2-way swap' : '1 credit'} · {timeLabel}
      </p>

      {request.note && (
        <RequestNote label={request.requesterId === myId ? 'Your note' : `Note from ${peerFirstName}`} text={request.note} />
      )}
      {request.counterNote && (
        <RequestNote
          label={request.lastProposedBy === myId ? 'Your note on these times' : `${peerFirstName}'s note on these times`}
          text={request.counterNote}
        />
      )}

      {request.cancelReason && (
        <RequestNote
          label={request.cancelledBy === myId ? 'Your reason for cancelling' : `${peerFirstName}'s reason for cancelling`}
          text={request.cancelReason}
        />
      )}

      {request.status === 'pending' && (
        <>
          {request.expiresAt && (
            <p className="mt-1 text-xs text-muted">Expires in {formatCountdown(Date.parse(request.expiresAt) - now)}</p>
          )}
          {request.lastProposedBy === myId && (
            <ul className="mt-3 space-y-1 text-sm">
              {request.proposedSlots.map((slot) => <li key={slot}>{formatSlotDateTime(slot)}</li>)}
            </ul>
          )}
          {/* The key resets the chosen time when a counter replaces the proposed times. */}
          <SwapRequestActions
            key={request.proposedSlots.join()}
            request={request}
            isMyTurn={request.lastProposedBy !== myId}
            peerFirstName={peerFirstName}
            onUpdated={onUpdated}
            onCounter={() => onCounter(request)}
          />
        </>
      )}

      {request.status === 'confirmed' && request.confirmedStartsAt && (
        <div className="mt-3 space-y-3">
          <p className="text-sm font-medium">{formatSlotDateTime(request.confirmedStartsAt)}</p>
          {hasAttendanceError && <AlertBanner message="Your meeting opened, but we couldn't record that you joined." />}
          <div className="flex flex-wrap gap-2">
            {request.meetingUrl && (
              <a href={request.meetingUrl} target="_blank" rel="noopener noreferrer" onClick={recordJoin} className={getButtonClasses('primary')}>
                Open meeting link
              </a>
            )}
            <Link to="/sessions" className={getButtonClasses('secondary')}>View in Sessions</Link>
          </div>
        </div>
      )}

      {isClosed && (
        <p className="mt-3 text-sm text-muted">
          These times are open again.
          {iPaid && (request.hasAlternatives ? ' Your credit stays in escrow while you answer the new times.' : ' Your credit has been refunded.')}
        </p>
      )}
    </article>
  )
}
