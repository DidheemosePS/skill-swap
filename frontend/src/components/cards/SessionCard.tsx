import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import type { SessionDetail } from '../../types'
import { canOfferAlternatives, formatCountdown, getSessionPhase } from '../../utils/sessions'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import { getButtonClasses } from '../common/buttonStyles'
import StatusPill from '../common/StatusPill'
import JoinMeetingButton from '../schedule/JoinMeetingButton'
import SessionOutcomeNote from './SessionOutcomeNote'
import { SESSION_PILLS } from './sessionStatusPills'

interface SessionCardProps {
  session: SessionDetail
  now: number
  onReschedule: (session: SessionDetail) => void
  onCancel: (session: SessionDetail) => void
  onResolve: (session: SessionDetail) => void
  onConfirm: (session: SessionDetail) => void
  onReview: (session: SessionDetail) => void
}

export default function SessionCard({ session, now, onReschedule, onCancel, onResolve, onConfirm, onReview }: SessionCardProps) {
  const { id: myId } = useCurrentUser()
  const { partner, skillName, returnSkillName, isTeaching } = session
  const phase = getSessionPhase(session, now)
  const pill = SESSION_PILLS[phase]
  const msUntilStart = Date.parse(session.startsAt) - now
  const topic = isTeaching ? `You teach ${skillName}` : `You learn ${skillName}`
  const returnTopic = returnSkillName && (isTeaching ? `, you learn ${returnSkillName}` : `, you teach ${returnSkillName}`)

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <Avatar name={partner.name} url={partner.avatarUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            <Link to={`/user/${partner.id}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
              {partner.name}
            </Link>
          </h3>
          <p className="text-sm text-muted">{topic}{returnTopic}</p>
        </div>
        {pill && <StatusPill label={pill.label} tone={pill.tone} />}
      </div>

      <p className="mt-3 text-sm font-medium">{formatSlotDateTime(session.startsAt)}</p>
      <p className="text-sm text-muted">
        {session.swapType === 'two_way' ? 'Free 2-way swap' : '1 credit'}
        {phase === 'confirmed' && (
          <span role="timer" className="font-medium text-ink tabular-nums">
            {' · '}{msUntilStart > 0 ? `Starts in ${formatCountdown(msUntilStart)}` : 'In progress'}
          </span>
        )}
      </p>

      <SessionOutcomeNote session={session} phase={phase} now={now} />

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {phase === 'pending_learner_review' && !isTeaching && <Button onClick={() => onConfirm(session)}>Confirm or dispute</Button>}
        {phase === 'confirmed' && (
          <>
            <JoinMeetingButton session={session} now={now} className="w-full" />
            {session.conversationExists && (
              <Link to={`/messages?peer=${partner.id}`} className={getButtonClasses('secondary')}>Chat</Link>
            )}
            {/* Calling off a session isn't possible once it has started. */}
            {msUntilStart > 0 && canOfferAlternatives(session, myId) && (
              <Button variant="secondary" onClick={() => onReschedule(session)}>Reschedule</Button>
            )}
            {msUntilStart > 0 && <Button variant="secondary" onClick={() => onCancel(session)}>Cancel session</Button>}
          </>
        )}
        {phase === 'awaiting_settlement' && <Button onClick={() => onResolve(session)}>Mark outcome</Button>}
        {phase === 'completed' && !session.hasMyReview && (
          <Button variant="secondary" onClick={() => onReview(session)}>Leave a review</Button>
        )}
        {phase === 'completed' && session.hasMyReview && <p className="text-sm text-muted">You reviewed this session.</p>}
      </div>
    </article>
  )
}
