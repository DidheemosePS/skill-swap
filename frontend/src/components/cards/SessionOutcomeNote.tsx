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
    <blockquote className="mt-3 rounded-lg bg-canvas p-3 text-sm [overflow-wrap:anywhere]">
      <p className="mb-1 text-xs font-semibold text-muted">{label}</p>
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
  const muted = 'mt-3 text-sm text-muted'

  if (phase === 'awaiting_settlement') {
    return <p className={muted}>If nobody marks it, it goes to admin review in <Countdown ms={getAutoResolveEndMs(session) - now} />.</p>
  }
  if (phase === 'pending_learner_review' && teacherMarkedAt) {
    const left = <Countdown ms={getReviewWindowEndMs(teacherMarkedAt) - now} />
    return isTeaching ? (
      <p className={muted}>You marked this completed. Your 1 credit arrives when {firstName} confirms, or in {left} unless {firstName} disputes it.</p>
    ) : (
      <p className={muted}>{firstName} marked this completed. Your 1 credit goes to them when you confirm, or in {left} unless you dispute it.</p>
    )
  }
  if (phase === 'no_show_confirmed' && noShow) {
    const absent = isMine(noShow.absentId) ? 'you' : firstName
    const teacherAbsent = noShow.absentId === teacherId
    const credit = swapType === 'two_way'
      ? ''
      : teacherAbsent
        ? (isTeaching ? ` ${firstName}'s credit was refunded.` : ' Your 1 credit was refunded.')
        : (isTeaching ? ' You received 1 credit.' : ` Your 1 credit went to ${firstName}.`)
    // With no meeting record the records decide it; a member who joined at all was judged by an admin.
    const hasRecord = session.attendance.some((record) => record.userId === noShow.absentId)
    const finder = hasRecord ? 'An admin found that' : 'The meeting records show'
    return <p className={muted}>{finder} {absent} didn't attend.{credit}</p>
  }
  if (phase === 'disputed' && dispute) {
    const opener = {
      no_show: isMine(dispute.raisedBy) ? 'You reported a no-show' : `${firstName} reported a no-show`,
      completion: isMine(dispute.raisedBy) ? `You disputed ${firstName}'s marking` : `${firstName} disputed your marking`,
      no_outcome: 'Nobody marked an outcome within 72 hours',
    }[dispute.cause]
    // A no-show report is checked against the meeting records for 24 hours before an admin gets it.
    const verifyEndMs = dispute.cause === 'no_show' ? getVerificationEndMs(dispute.raisedAt) : null
    const absent = isMine(dispute.raisedBy) ? firstName : 'you'
    const progress = verifyEndMs === null
      ? 'Any credit stays in escrow until an admin decides.'
      : verifyEndMs > now
        ? <>We're checking the meeting records, with a result in <Countdown ms={verifyEndMs - now} />. Any credit stays in escrow until then.</>
        : `The meeting records show ${absent} joined, so an admin decides. Any credit stays in escrow until then.`
    return (
      <>
        {dispute.reason && (
          <Quote label={isMine(dispute.raisedBy) ? 'Your reason for disputing' : `${firstName}'s reason for disputing`} text={dispute.reason} />
        )}
        <p className={muted}>{opener}. {progress}</p>
      </>
    )
  }
  if (phase === 'cancelled' && cancellation) {
    return (
      <Quote
        label={isMine(cancellation.cancelledBy) ? 'Your reason for cancelling' : `${firstName}'s reason for cancelling`}
        text={cancellation.reason}
      />
    )
  }
  return null
}
