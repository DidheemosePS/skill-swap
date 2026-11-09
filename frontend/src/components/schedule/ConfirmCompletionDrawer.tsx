import { useState } from 'react'
import { completeSession, disputeCompletion, SessionClosedError } from '../../services/sessionActions'
import type { SessionDetail } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import NoteField from '../common/NoteField'
import AttendanceSummary from './AttendanceSummary'

interface ConfirmCompletionDrawerProps {
  session: SessionDetail
  onClose: () => void
  onConfirmed: () => void
  onDisputed: () => void
}

// The learner's answer to a teacher marking a one-way session completed.
export default function ConfirmCompletionDrawer({ session, onClose, onConfirmed, onDisputed }: ConfirmCompletionDrawerProps) {
  const { partner, skillName } = session
  const firstName = partner.name.split(' ')[0]
  const [pending, setPending] = useState<'confirm' | 'dispute' | null>(null)
  const [isDisputing, setIsDisputing] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function run(action: 'confirm' | 'dispute') {
    setPending(action)
    setError(null)
    try {
      if (action === 'confirm') {
        await completeSession(session.id)
        onConfirmed()
      } else {
        await disputeCompletion(session.id, reason.trim())
        onDisputed()
      }
    } catch (cause) {
      setError(cause instanceof SessionClosedError ? 'This session has already been settled.' : "We couldn't save that. Please try again.")
      setPending(null)
    }
  }

  return (
    <Modal title={`${firstName} marked this completed`} onClose={onClose} isLocked={pending !== null} placement="drawer">
      <p className="mt-2 text-sm text-muted">
        {skillName} with {partner.name}, {formatSlotDateTime(session.startsAt)}.
      </p>
      <AttendanceSummary session={session} />
      {error && <div className="mt-4"><AlertBanner message={error} /></div>}

      {isDisputing ? (
        <>
          <NoteField
            label="What went wrong? (required)"
            value={reason}
            onChange={setReason}
            placeholder="An admin reads this when reviewing the session"
          />
          <p className="mt-2 text-sm">An admin reviews it with the meeting records. Your 1 credit stays in escrow until they decide.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => run('dispute')} disabled={reason.trim() === ''} isLoading={pending === 'dispute'}>Send dispute</Button>
            <Button variant="secondary" onClick={() => setIsDisputing(false)} disabled={pending !== null}>Go back</Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm">Confirming releases your 1 credit to {firstName} right away.</p>
          <div className="mt-5 flex flex-col gap-2">
            <Button onClick={() => run('confirm')} isLoading={pending === 'confirm'} disabled={pending !== null}>Confirm session</Button>
            <Button variant="secondary" onClick={() => setIsDisputing(true)} disabled={pending !== null}>Dispute</Button>
            <Button variant="secondary" onClick={onClose} disabled={pending !== null}>Decide later</Button>
          </div>
        </>
      )}
    </Modal>
  )
}
