import { useState } from 'react'
import { useNow } from '../../hooks/useNow'
import { completeSession, raiseConcern, SessionClosedError } from '../../services/sessionActions'
import type { SessionDetail } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Button from '../common/Button'
import Modal from '../common/Modal'
import NoteField from '../common/NoteField'
import AttendanceSummary from './AttendanceSummary'
import { getSettlingLine } from './settlingCopy'
import { useToast } from '../../hooks/useToast'

export type SettleStep = 'confirm' | 'concern'

interface SettlingDrawerProps {
  session: SessionDetail
  // Which button opened it: Confirm now, or Raise a concern.
  step: SettleStep
  onClose: () => void
  // Confirmed: settled says whether both have now confirmed, which moves the credit at once.
  onConfirmed: (settled: boolean) => void
  onConcernRaised: () => void
}

// A settling session's outcome with the meeting records behind it. Nothing here is required: the credit moves
// on its own when the window ends. Confirm now settles early once both agree; a concern holds it for an admin.
export default function SettlingDrawer({ session, step: initialStep, onClose, onConfirmed, onConcernRaised }: SettlingDrawerProps) {
  const { partner, skillName } = session
  const firstName = partner.name.split(' ')[0]
  const now = useNow(60_000)
  const [step, setStep] = useState(initialStep)
  const [pending, setPending] = useState<SettleStep | null>(null)
  const [reason, setReason] = useState('')
  const toast = useToast()

  async function run(action: SettleStep) {
    setPending(action)
    try {
      if (action === 'confirm') onConfirmed((await completeSession(session.id)) !== 'awaiting_settlement')
      else {
        await raiseConcern(session.id, reason.trim())
        onConcernRaised()
      }
    } catch (cause) {
      toast.error(cause instanceof SessionClosedError ? 'This session has already settled.' : "We couldn't save that. Please try again.")
      setPending(null)
    }
  }

  return (
    <Modal title={step === 'concern' ? 'Raise a concern' : `Your ${skillName} session with ${firstName}`} onClose={onClose} isLocked={pending !== null}>
      <p className="mt-2 text-sm text-muted">{formatSlotDateTime(session.startsAt)}. {getSettlingLine(session, now)}</p>
      <AttendanceSummary session={session} />

      {step === 'concern' ? (
        <>
          <NoteField label="What went wrong? (required)" value={reason} onChange={setReason} placeholder="An admin reads this with the meeting records" />
          <p className="mt-2 text-sm">The credit stays held until an admin decides.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => run('concern')} disabled={reason.trim() === ''} isLoading={pending === 'concern'}>Send to an admin</Button>
            <Button variant="secondary" onClick={() => setStep('confirm')} disabled={pending !== null}>Go back</Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm">
            {session.confirmedBy.includes(partner.id)
              ? `${firstName} has confirmed, so confirming now settles it straight away.`
              : 'If you both confirm, it settles now instead of waiting. If not, it settles on its own.'}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button onClick={() => run('confirm')} isLoading={pending === 'confirm'} disabled={pending !== null}>Confirm now</Button>
            <Button variant="secondary" onClick={() => setStep('concern')} disabled={pending !== null}>Raise a concern</Button>
          </div>
        </>
      )}
    </Modal>
  )
}
