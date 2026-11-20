import { useState } from 'react'
import { useTimeProposal } from '../../hooks/useTimeProposal'
import { counterSwapRequest } from '../../services/swapRequestActions'
import { SlotTakenError } from '../../services/swapRequestService'
import type { Message, SwapRequest } from '../../types'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { formatSlotDateTime } from '../../utils/timeSlots'
import NoteField from '../common/NoteField'
import TimeProposalFields from '../schedule/TimeProposalFields'
import { useToast } from '../../hooks/useToast'

interface CounterOfferModalProps {
  request: SwapRequest
  peerId: string
  peerFirstName: string
  onUpdated: (message: Message) => void
  onClose: () => void
}

const MAX_PROPOSED_SLOTS = 3

export default function CounterOfferModal({ request, peerId, peerFirstName, onUpdated, onClose }: CounterOfferModalProps) {
  const proposal = useTimeProposal()
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  async function submit() {
    setIsSubmitting(true)
    try {
      onUpdated(await counterSwapRequest(request.id, proposal.allTimes.toSorted(), note.trim() || null))
      onClose()
    } catch (cause) {
      if (cause instanceof SlotTakenError) {
        toast.error('One of those times was just taken. Please pick again.')
        proposal.reset()
      } else {
        toast.error("We couldn't send your new times. Please try again.")
      }
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={`Suggest new times to ${peerFirstName}`} onClose={onClose} isLocked={isSubmitting}>
      <p className="mt-2 text-sm text-muted">
        The current times open up for others once you send. Pick up to {MAX_PROPOSED_SLOTS} in total, from {peerFirstName}'s availability or your own suggestion.
        {request.swapType === 'one_way' && ' Any credit stays held while you agree on a time.'}
      </p>
      {/* The times being replaced, kept in view so they don't have to be remembered. */}
      <p className="mt-2 text-sm">
        <span className="font-semibold">{request.lastProposedBy === request.requesterId ? `${peerFirstName} proposed` : 'Currently proposed'}:</span>{' '}
        <span className="figures">{request.proposedSlots.map(formatSlotDateTime).join(' · ')}</span>
      </p>
      <TimeProposalFields
        key={proposal.reloadKey}
        peerId={peerId}
        peerFirstName={peerFirstName}
        ignoreId={request.id}
        proposal={proposal}
        max={MAX_PROPOSED_SLOTS}
      />
      <NoteField value={note} onChange={setNote} placeholder={`Tell ${peerFirstName} why these times work better`} />
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={submit} disabled={proposal.allTimes.length === 0} isLoading={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send new times'}
        </Button>
      </div>
    </Modal>
  )
}
