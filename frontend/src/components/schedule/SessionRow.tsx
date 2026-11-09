import type { UpcomingSession } from '../../types'
import { formatCountdown, getJoinState } from '../../utils/sessions'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import JoinMeetingButton from './JoinMeetingButton'

interface SessionRowProps {
  session: UpcomingSession
  now: number
}

export default function SessionRow({ session, now }: SessionRowProps) {
  const msUntilStart = Date.parse(session.startsAt) - now
  const joinState = getJoinState(session, now)

  return (
    <article>
      <div className="flex items-center gap-3">
        <Avatar name={session.partner.name} url={session.partner.avatarUrl} size="sm" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{session.partner.name}</h3>
          <p className="text-sm text-muted">{session.isTeaching ? 'Teaching' : 'Learning'} {session.skillName}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{formatSlotDateTime(session.startsAt)}</p>
      <p role="timer" className="mt-1 text-sm font-medium tabular-nums">
        {msUntilStart > 0 ? `Starts in ${formatCountdown(msUntilStart)}` : joinState === 'ended' ? 'Session ended' : 'In progress'}
      </p>
      <JoinMeetingButton session={session} now={now} className="mt-3 w-full" />
    </article>
  )
}
