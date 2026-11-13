import { useState } from 'react'
import { completeSession, reportNoShow, SessionClosedError } from '../../services/sessionActions'
import type { SessionDetail } from '../../types'
import { NO_SHOW_VERIFICATION_HOURS, REVIEW_WINDOW_HOURS } from '../../utils/sessions'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Button from '../common/Button'
import Modal from '../common/Modal'
import AttendanceSummary from './AttendanceSummary'
import { useToast } from '../../hooks/useToast'

// Under this many minutes in the meeting, the record points to a no-show rather than a lesson.
const ABSENT_UNDER_MINUTES = 15

interface PostSessionDrawerProps {
  session: SessionDetail
  onClose: () => void
  onCompleted: () => void
  onReported: () => void
}

export default function PostSessionDrawer({ session, onClose, onCompleted, onReported }: PostSessionDrawerProps) {
  const { partner, isTeaching, swapType, skillName } = session
  const firstName = partner.name.split(' ')[0]
  const [pending, setPending] = useState<'complete' | 'report' | null>(null)
  // A report starts a dispute, so it takes a second click.
  const [isConfirmingReport, setIsConfirmingReport] = useState(false)
  const toast = useToast()

  async function run(action: 'complete' | 'report') {
    setPending(action)
    try {
      if (action === 'complete') {
        await completeSession(session.id)
        onCompleted()
      } else {
        await reportNoShow(session.id)
        onReported()
      }
    } catch (cause) {
      toast.error(cause instanceof SessionClosedError ? 'This session has already been settled.' : "We couldn't save that. Please try again.")
      setPending(null)
    }
  }

  // The meeting record decides which outcome leads, so the dialog never nudges a member to pay for a lesson that didn't happen.
  const partnerRecord = session.attendance.find((record) => record.userId === partner.id)
  const looksAbsent = !partnerRecord || (partnerRecord.leftAt !== null && partnerRecord.durationMinutes < ABSENT_UNDER_MINUTES)
  const absentLine = partnerRecord
    ? `${firstName} was in for ${partnerRecord.durationMinutes} of ${session.durationMinutes} minutes.`
    : `${firstName} never joined the meeting.`

  // Who gets a held credit if the report stands: an absent teacher refunds the learner, an absent learner still pays.
  const noShowCreditLine = swapType === 'two_way'
    ? 'No credits are involved.'
    : isTeaching
      ? `${firstName}'s 1 credit stays held until then, and is paid to you if the report stands.`
      : `Your 1 credit stays held until then, and comes back to you if the report stands.`

  const creditLine = swapType === 'two_way'
    ? 'This was a free swap, so no credit moves.'
    : isTeaching
      ? `Marking it completed gives ${firstName} ${REVIEW_WINDOW_HOURS} hours to confirm or dispute. ${firstName}'s held credit comes to you when they confirm, or when the time runs out.`
      : `Marking it completed releases your 1 credit to ${firstName}.`

  return (
    <Modal title="How did it go?" onClose={onClose} isLocked={pending !== null}>
      <p className="mt-2 text-sm text-muted">
        {skillName} with {partner.name}, {formatSlotDateTime(session.startsAt)}.
      </p>
      <AttendanceSummary session={session} />
      {/* With an absent partner, completing is the secondary path, so its consequence reads after the buttons. */}
      {!looksAbsent && <p className="mt-4 text-sm">{creditLine}</p>}

      {isConfirmingReport ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium">
            {/* Says what happens to this report given the record, rather than both branches of the rule. */}
            Report that {firstName} didn't attend?{' '}
            {partnerRecord
              ? `${firstName} joined for ${partnerRecord.durationMinutes} minutes, so an admin reviews the meeting records before deciding.`
              : `${firstName} never joined, so the report stands after a ${NO_SHOW_VERIFICATION_HOURS}-hour check of the meeting records.`}{' '}
            {noShowCreditLine}
          </p>
          <div className="flex flex-wrap gap-2">
            {/* The step replaces the button that was focused, so focus moves to the new choice instead of dropping to the page. */}
            <Button autoFocus onClick={() => run('report')} isLoading={pending === 'report'}>Yes, report no-show</Button>
            <Button variant="secondary" onClick={() => setIsConfirmingReport(false)} disabled={pending !== null}>Go back</Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {looksAbsent && <p className="mb-1 text-sm"><span className="font-semibold">{absentLine}</span> Reporting a no-show starts a check of the meeting records.</p>}
          {looksAbsent ? (
            <>
              <Button onClick={() => setIsConfirmingReport(true)} disabled={pending !== null}>Report no-show</Button>
              <Button variant="secondary" onClick={() => run('complete')} isLoading={pending === 'complete'} disabled={pending !== null}>Mark as completed</Button>
            </>
          ) : (
            <>
              <Button onClick={() => run('complete')} isLoading={pending === 'complete'} disabled={pending !== null}>Mark as completed</Button>
              <Button variant="secondary" onClick={() => setIsConfirmingReport(true)} disabled={pending !== null}>Report no-show</Button>
            </>
          )}
          {looksAbsent && <p className="text-sm text-muted">{creditLine}</p>}
          <Button variant="secondary" onClick={onClose} disabled={pending !== null}>Decide later</Button>
        </div>
      )}
    </Modal>
  )
}
