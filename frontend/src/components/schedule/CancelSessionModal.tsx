import { useState } from 'react'
import { useTimeProposal } from '../../hooks/useTimeProposal'
import { SessionClosedError } from '../../services/sessionActions'
import { cancelSession } from '../../services/sessionCancellation'
import { SlotTakenError } from '../../services/swapRequestService'
import type { SessionDetail } from '../../types'
import { CANCEL_CUTOFF_HOURS, isLateCancel } from '../../utils/sessions'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Button from '../common/Button'
import Modal from '../common/Modal'
import NoteField from '../common/NoteField'
import TimeProposalFields from './TimeProposalFields'
import { useToast } from '../../hooks/useToast'

interface CancelSessionModalProps {
  session: SessionDetail
  // Rescheduling is cancelling with new times, so those times become required.
  mode: 'cancel' | 'reschedule'
  canOfferTimes: boolean
  onClose: () => void
  onDone: () => void
}

const MAX_ALTERNATIVES = 3

export default function CancelSessionModal({ session, mode, canOfferTimes, onClose, onDone }: CancelSessionModalProps) {
  const { partner, swapType, isTeaching } = session
  const firstName = partner.name.split(' ')[0]
  const proposal = useTimeProposal()
  const [reason, setReason] = useState('')
  const [isOfferingTimes, setIsOfferingTimes] = useState(mode === 'reschedule')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const alternatives = isOfferingTimes ? proposal.allTimes : []
  const isReady = reason.trim() !== '' && (!isOfferingTimes || alternatives.length > 0)

  // Read once when the dialog opens, so the warning can't flip while the member is typing a reason.
  const [isLate] = useState(() => isLateCancel(session.startsAt, Date.now()))
  const creditLine = swapType === 'two_way' || isTeaching
    ? null
    : `Your 1 credit is refunded, and ${firstName}'s time opens up for others.`
  // Past the cutoff the outcome changes, so it's said before the member confirms. A late cancel counts as an absence.
  const lateLine = swapType === 'two_way'
    ? 'No credit moves, but it counts as a late cancel on your record.'
    : isTeaching
      ? `${firstName} gets the credit back, and it counts as a late cancel on your record.`
      : `If you cancel now, your credit goes to ${firstName}, and it counts as a late cancel.`

  async function submit() {
    setIsSubmitting(true)
    try {
      await cancelSession(session.id, reason.trim(), alternatives.toSorted())
      onDone()
    } catch (cause) {
      if (cause instanceof SlotTakenError) {
        toast.error('One of those times was just taken. Please pick again.')
        proposal.reset()
      } else if (cause instanceof SessionClosedError) {
        toast.error('This session has already started or been cancelled.')
      } else {
        toast.error("We couldn't cancel this session. Please try again.")
      }
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'cancel' ? 'Cancel this session?' : 'Reschedule this session'} onClose={onClose} isLocked={isSubmitting}>
      <p className="mt-2 text-sm text-muted">
        {session.skillName} with {partner.name}, {formatSlotDateTime(session.startsAt)}. {firstName} sees your reason in your chat.
      </p>
      <NoteField
        label="Reason (required)"
        value={reason}
        onChange={setReason}
        placeholder={`Tell ${firstName} why this time no longer works`}
      />

      {canOfferTimes && mode === 'cancel' && (
        <label className="mt-2 flex min-h-9 cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={isOfferingTimes} onChange={(event) => setIsOfferingTimes(event.target.checked)} className="size-4 accent-accent" />
          Offer alternative times
        </label>
      )}
      {isOfferingTimes && (
        <TimeProposalFields
          key={proposal.reloadKey}
          peerId={partner.id}
          peerFirstName={firstName}
          ignoreId={session.id}
          proposal={proposal}
          max={MAX_ALTERNATIVES}
        />
      )}
      {isLate && !isOfferingTimes ? (
        <p role="note" className="mt-3 rounded-lg bg-coral-soft p-3 text-sm text-ink">
          <span className="font-semibold">Less than {CANCEL_CUTOFF_HOURS} hours to go.</span> {lateLine}
        </p>
      ) : (
        !isOfferingTimes && creditLine && <p className="mt-3 text-sm text-muted">{creditLine}</p>
      )}
      {/* Only true when there's no chat yet; members who already talk keep their chat. */}
      {isOfferingTimes && !session.conversationExists && <p className="mt-3 text-sm text-muted">Chat stays locked until {firstName} accepts, unless you already have another session together.</p>}

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Keep the session</Button>
        <Button onClick={submit} disabled={!isReady} isLoading={isSubmitting}>
          {mode === 'cancel' && !isOfferingTimes ? (isLate ? 'Cancel anyway' : 'Cancel session') : 'Send new times'}
        </Button>
      </div>
    </Modal>
  )
}
