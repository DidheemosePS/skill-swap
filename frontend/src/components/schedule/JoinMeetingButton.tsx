import type { Session } from '../../types'
import { getJoinState, JOIN_WINDOW_MINUTES } from '../../utils/sessions'
import Button from '../common/Button'
import { getButtonClasses } from '../common/buttonStyles'
import type { ButtonVariant } from '../common/buttonStyles'

interface JoinMeetingButtonProps {
  session: Pick<Session, 'id' | 'startsAt' | 'durationMinutes' | 'meetingUrl'>
  now: number
  className?: string
  // Secondary where another Join on the page is already the primary action.
  variant?: ButtonVariant
  // Named in the accessible label so a list of links can tell two Join buttons apart.
  partnerName?: string
}

export default function JoinMeetingButton({ session, now, className = '', variant = 'primary', partnerName }: JoinMeetingButtonProps) {
  const joinState = getJoinState(session, now)

  return (
    <>
      {joinState === 'open' && session.meetingUrl ? (
        // A real link rather than window.open, so popup blockers never stop someone joining. The meeting
        // provider records who joined; the browser reports nothing.
        <a
          href={session.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={partnerName ? `Join meeting with ${partnerName}` : undefined}
          className={getButtonClasses(variant, className)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="13" height="12" rx="2" />
            <path d="M16 10.5 21 8v8l-5-2.5" />
          </svg>
          Join meeting
        </a>
      ) : (
        <Button variant="secondary" disabled className={className}>
          {joinState === 'ended' ? 'Session ended' : `Join opens ${JOIN_WINDOW_MINUTES} min before`}
        </Button>
      )}
    </>
  )
}
