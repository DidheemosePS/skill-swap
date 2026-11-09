import { useState } from 'react'
import { completeSession, reportNoShow, SessionClosedError } from '../../services/sessionActions'
import type { SessionDetail } from '../../types'
import { NO_SHOW_VERIFICATION_HOURS, REVIEW_WINDOW_HOURS } from '../../utils/sessions'
import { formatSlotDateTime } from '../../utils/timeSlots'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import AttendanceSummary from './AttendanceSummary'

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
  const [error, setError] = useState<string | null>(null)

  async function run(action: 'complete' | 'report') {
    setPending(action)
    setError(null)
    try {
      if (action === 'complete') {
        await completeSession(session.id)
        onCompleted()
      } else {
        await reportNoShow(session.id)
        onReported()
      }
    } catch (cause) {
      setError(cause instanceof SessionClosedError ? 'This session has already been settled.' : "We couldn't save that. Please try again.")
      setPending(null)
    }
  }

  const creditLine = swapType === 'two_way'
    ? 'This was a free swap, so no credit moves.'
    : isTeaching
      ? `Marking it completed gives ${firstName} ${REVIEW_WINDOW_HOURS} hours to confirm or dispute. Your 1 credit arrives when they confirm, or when the time runs out.`
      : `Marking it completed releases your 1 credit to ${firstName}.`

  return (
    <Modal title="How did it go?" onClose={onClose} isLocked={pending !== null} placement="drawer">
      <p className="mt-2 text-sm text-muted">
        {skillName} with {partner.name}, {formatSlotDateTime(session.startsAt)}.
      </p>
      <AttendanceSummary session={session} />
      <p className="mt-4 text-sm">{creditLine}</p>
      {error && <div className="mt-4"><AlertBanner message={error} /></div>}

      {isConfirmingReport ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium">
            Report that {firstName} didn't attend? We check the meeting records for {NO_SHOW_VERIFICATION_HOURS} hours. If {firstName} never
            joined, the report stands. If they did, an admin decides. Any credit stays in escrow until then.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run('report')} isLoading={pending === 'report'}>Yes, report no-show</Button>
            <Button variant="secondary" onClick={() => setIsConfirmingReport(false)} disabled={pending !== null}>Go back</Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={() => run('complete')} isLoading={pending === 'complete'} disabled={pending !== null}>Mark as Completed</Button>
          <Button variant="secondary" onClick={() => setIsConfirmingReport(true)} disabled={pending !== null}>Report No-Show</Button>
          <Button variant="secondary" onClick={onClose} disabled={pending !== null}>Decide later</Button>
        </div>
      )}
    </Modal>
  )
}
