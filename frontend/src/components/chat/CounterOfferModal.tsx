import { useState } from 'react'
import { useTimeProposal } from '../../hooks/useTimeProposal'
import { counterSwapRequest } from '../../services/swapRequestActions'
import { SlotTakenError } from '../../services/swapRequestService'
import type { Message, SwapRequest } from '../../types'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import NoteField from '../common/NoteField'
import TimeProposalFields from '../schedule/TimeProposalFields'

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
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setIsSubmitting(true)
    setError(null)
    try {
      onUpdated(await counterSwapRequest(request.id, [...proposal.allTimes].sort(), note.trim() || null))
      onClose()
    } catch (cause) {
      if (cause instanceof SlotTakenError) {
        setError('One of those times was just taken. Please pick again.')
        proposal.reset()
      } else {
        setError("We couldn't send your new times. Please try again.")
      }
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={`Suggest new times to ${peerFirstName}`} onClose={onClose} isLocked={isSubmitting}>
      <p className="mt-2 text-sm text-muted">
        The current times open up for others once you send. Pick up to {MAX_PROPOSED_SLOTS} in total, from {peerFirstName}'s availability or your own suggestion.
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
      {error && <div className="mt-4"><AlertBanner message={error} /></div>}
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={submit} disabled={proposal.allTimes.length === 0} isLoading={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send new times'}
        </Button>
      </div>
    </Modal>
  )
}
