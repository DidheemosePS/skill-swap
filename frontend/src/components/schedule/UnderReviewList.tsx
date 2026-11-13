import { useCurrentUser } from '../../hooks/useAuth'
import type { SessionDetail } from '../../types'
import { formatCountdown, getReviewWindowEndMs, getVerificationEndMs } from '../../utils/sessions'
import Avatar from '../common/Avatar'
import { getSessionStatus } from './sessionStatus'

interface UnderReviewListProps {
  sessions: SessionDetail[]
  now: number
}

// When the step settles itself, or null when nobody can say (an admin is deciding).
function getEnd(session: SessionDetail): { label: string; ms: number } | null {
  if (session.status === 'disputed' && session.dispute?.cause === 'no_show') return { label: 'Result in', ms: getVerificationEndMs(session.dispute.raisedAt) }
  if (session.status === 'pending_learner_review' && session.teacherMarkedAt) return { label: 'Paid in', ms: getReviewWindowEndMs(session.teacherMarkedAt) }
  return null
}

// Ended sessions the member has already answered, now being checked or confirmed by someone else. Nothing to do
// here, so it reads as a notice: one quiet line each and the time until it settles, never a button.
export default function UnderReviewList({ sessions, now }: UnderReviewListProps) {
  const { id: myId } = useCurrentUser()
  return (
    <ul className="divide-y divide-line/70 rounded-2xl border border-line px-4 sm:px-5">
      {sessions.map((session) => {
        const end = getEnd(session)
        const isRunning = end !== null && end.ms > now
        return (
          <li key={session.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
            <Avatar name={session.partner.name} url={session.partner.avatarUrl} size="xs" />
            {/* Full width on phones, so the timer drops to its own line instead of squeezing the words. */}
            <div className="min-w-0 basis-[calc(100%-2.5rem)] text-sm sm:flex-1 sm:basis-auto">
              <p className="font-medium text-ink">{session.skillName} with {session.partner.name.split(' ')[0]}</p>
              <p className="text-muted">{getSessionStatus(session, session.status, myId, now).label}</p>
            </div>
            <p className="ml-10 flex items-center gap-1.5 text-sm text-muted sm:ml-0">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M8 5v3.2l2 1.3" />
              </svg>
              {isRunning ? <>{end.label} <span className="figures font-medium text-ink">{formatCountdown(end.ms - now)}</span></> : 'An admin decides'}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
