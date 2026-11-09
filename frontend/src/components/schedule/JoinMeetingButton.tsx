import { useState } from 'react'
import { logAttendance } from '../../services/sessionService'
import type { Session } from '../../types'
import { getJoinState, JOIN_WINDOW_MINUTES } from '../../utils/sessions'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import { getButtonClasses } from '../common/buttonStyles'

interface JoinMeetingButtonProps {
  session: Pick<Session, 'id' | 'startsAt' | 'durationMinutes' | 'meetingUrl'>
  now: number
  className?: string
}

export default function JoinMeetingButton({ session, now, className = '' }: JoinMeetingButtonProps) {
  const [hasLogError, setHasLogError] = useState(false)
  const joinState = getJoinState(session, now)

  // The meeting opens either way; a failed log is surfaced because no-show checks rely on it.
  function recordJoin() {
    setHasLogError(false)
    logAttendance(session.id).catch(() => setHasLogError(true))
  }

  return (
    <>
      {joinState === 'open' && session.meetingUrl ? (
        // A real link rather than window.open, so popup blockers never stop someone joining.
        <a
          href={session.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={recordJoin}
          className={getButtonClasses('primary', className)}
        >
          <span aria-hidden="true">🎥</span> Join Meeting
        </a>
      ) : (
        <Button variant="secondary" disabled className={className}>
          {joinState === 'ended' ? 'Session ended' : `Join opens ${JOIN_WINDOW_MINUTES} min before`}
        </Button>
      )}
      {hasLogError && (
        <div className="mt-3">
          <AlertBanner message="Your meeting opened, but we couldn't record that you joined." onRetry={recordJoin} />
        </div>
      )}
    </>
  )
}
