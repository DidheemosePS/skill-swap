import type { ReactNode } from 'react'
import { useCurrentUser } from '../../hooks/useAuth'
import type { SessionDetail } from '../../types'
import { getCreditChange } from '../../utils/sessions'
import { formatSlotDay } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import { describeDeal } from './sessionLabels'
import { getSessionStatus } from './sessionStatus'

interface HistoryStatementProps {
  sessions: SessionDetail[]
  onReview: (session: SessionDetail) => void
  // "Show all", kept inside the card under the last row.
  footer?: ReactNode
}

const signed = (change: number) => (change > 0 ? `+${change}` : change < 0 ? `−${-change}` : '0')

// Settled sessions, one line each: who, what happened, when, and what it did to the balance on the right,
// so "where did my credits go" is answered by reading down one column.
export default function HistoryStatement({ sessions, onReview, footer }: HistoryStatementProps) {
  const { id: myId } = useCurrentUser()
  return (
    <div className="rounded-2xl border border-line bg-card px-4 sm:px-5">
      <ul aria-label="Past sessions and the credits each one moved">
        {sessions.map((session) => {
          const change = getCreditChange(session, myId)
          const status = getSessionStatus(session, session.status, myId).label
          const canReview = session.status === 'completed' && !session.hasMyReview
          // Only a session that happened is told in the past tense; a cancelled one says what was planned.
          const what = describeDeal({ partnerName: session.partner.name, skillName: session.skillName, returnSkillName: session.returnSkillName, isTeaching: session.isTeaching }, session.status === 'completed' ? 'past' : session.status === 'cancelled' ? 'called_off' : 'neutral')
          return (
            <li key={session.id} className="flex items-center gap-3 border-t border-line/70 py-3.5 first:border-t-0">
              <Avatar name={session.partner.name} url={session.partner.avatarUrl} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="text-ink">{what}</p>
                {/* The date sits in a fixed column, so statuses line up whatever the date's length. */}
                <p className="flex flex-wrap gap-x-3 text-sm text-muted">
                  <span className="figures w-20 shrink-0">{formatSlotDay(session.startsAt)}</span>
                  {status !== 'Completed' && <span>{status}</span>}
                  {canReview && <span><button type="button" onClick={() => onReview(session)} className="rounded font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">Leave a review</button></span>}
                </p>
              </div>
              <p className={`figures w-10 shrink-0 text-right font-display text-lg font-semibold ${change > 0 ? 'text-success' : change < 0 ? 'text-ink' : 'text-faint'}`}>
                <span className="sr-only">{change === 0 ? 'No credits moved' : change > 0 ? 'Earned' : 'Spent'} </span>
                <span aria-hidden={change === 0}>{signed(change)}</span>
              </p>
            </li>
          )
        })}
      </ul>
      {footer}
    </div>
  )
}
