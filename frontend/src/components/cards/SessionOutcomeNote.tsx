import { useCurrentUser } from '../../hooks/useAuth'
import type { SessionDetail, SessionStatus } from '../../types'
import { formatCountdown, getAutoResolveEndMs, getReviewWindowEndMs, getVerificationEndMs } from '../../utils/sessions'

interface SessionOutcomeNoteProps {
  session: SessionDetail
  phase: SessionStatus
  now: number
}

function Quote({ label, text }: { label: string; text: string }) {
  return (
    <blockquote className="mt-2 rounded-lg bg-canvas p-3 text-sm [overflow-wrap:anywhere]">
      <p className="mb-1 text-xs font-medium text-muted">{label}</p>
      {text}
    </blockquote>
  )
}

const Countdown = ({ ms }: { ms: number }) => <span className="tabular-nums">{formatCountdown(ms)}</span>

// What happened after a session ended, and where the credit stands, in the card's own words.
export default function SessionOutcomeNote({ session, phase, now }: SessionOutcomeNoteProps) {
  const { id: myId } = useCurrentUser()
  const { partner, isTeaching, swapType, teacherId, teacherMarkedAt, noShow, dispute, cancellation } = session
  const firstName = partner.name.split(' ')[0]
  const isMine = (userId: string | null) => userId === myId
  const muted = 'mt-1 text-sm text-muted'
  // Whose credit is waiting, named with its noun, never "escrow": the same word as the navbar's "held".
  const held = swapType === 'two_way' ? 'Free swap' : isTeaching ? `${firstName}'s credit held` : 'Your credit held'

  if (phase === 'awaiting_settlement') {
    return <p className={muted}>{held} · goes to review in <Countdown ms={getAutoResolveEndMs(session) - now} /></p>
  }
  if (phase === 'pending_learner_review' && teacherMarkedAt) {
    const left = <Countdown ms={getReviewWindowEndMs(teacherMarkedAt) - now} />
    return isTeaching ? (
      <p className={muted}>You marked it complete · paid in {left} unless disputed</p>
    ) : (
      <p className={muted}>{firstName} marked it complete · pays in {left} unless you dispute</p>
    )
  }
  if (phase === 'no_show_confirmed' && noShow) {
    const absent = isMine(noShow.absentId) ? 'You' : firstName
    const teacherAbsent = noShow.absentId === teacherId
    const credit = swapType === 'two_way'
      ? ''
      : teacherAbsent
        ? ' · credit refunded'
        : (isTeaching ? ' · +1 credit to you' : ` · credit paid to ${firstName}`)
    return <p className={muted}>{absent} didn't attend{credit}</p>
  }
  if (phase === 'disputed' && dispute) {
    // A no-show report is checked against the meeting records for 24 hours before an admin gets it.
    const verifyEndMs = dispute.cause === 'no_show' ? getVerificationEndMs(dispute.raisedAt) : null
    const progress = verifyEndMs !== null && verifyEndMs > now
      ? <>Result in <Countdown ms={verifyEndMs - now} /></>
      : 'An admin decides'
    return (
      <>
        {dispute.reason && (
          <Quote label={isMine(dispute.raisedBy) ? 'Your reason' : `${firstName}'s reason`} text={dispute.reason} />
        )}
        {/* The row's status already says who raised it, so the note only adds when it ends and the credit. */}
        <p className={muted}>{progress} · {held}</p>
      </>
    )
  }
  if (phase === 'cancelled' && cancellation) {
    return (
      <Quote
        label={isMine(cancellation.cancelledBy) ? 'Your reason' : `${firstName}'s reason`}
        text={cancellation.reason}
      />
    )
  }
  return null
}
