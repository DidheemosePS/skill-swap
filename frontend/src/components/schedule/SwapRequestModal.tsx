import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncData } from '../../hooks/useAsyncData'
import { fetchPeerSlots } from '../../services/slotService'
import { createSwapRequest, SlotTakenError } from '../../services/swapRequestService'
import type { SwapOffer, UserSkill } from '../../types'
import { getViewerTimezone } from '../../utils/availability'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import Modal from '../common/Modal'
import NoteField from '../common/NoteField'
import SelectField from '../common/SelectField'
import SlotAvailability from './SlotAvailability'

interface SwapRequestModalProps {
  offer: SwapOffer
  // Null when the wallet hasn't loaded; the server still rejects a request without credit.
  credits: number | null
  onClose: () => void
}

const MAX_PROPOSED_SLOTS = 3

const toOptions = (skills: UserSkill[], ids: string[]) =>
  ids.map((id) => ({
    value: id,
    label: skills.find(({ skill }) => skill.id === id)?.skill.name ?? id,
  }))

export default function SwapRequestModal({ offer, credits, onClose }: SwapRequestModalProps) {
  const navigate = useNavigate()
  const { peer } = offer
  const firstName = peer.name.split(' ')[0]
  const fetchSlots = useCallback(() => fetchPeerSlots(peer.id), [peer.id])
  const peerSlots = useAsyncData(fetchSlots)
  const [selected, setSelected] = useState<string[]>([])
  const [skillId, setSkillId] = useState(offer.teachesYou[0])
  const [returnSkillId, setReturnSkillId] = useState<string | null>(offer.learnsFromYou[0] ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const isOutOfCredits = offer.creditCost === 1 && credits === 0

  function toggleSlot(slot: string) {
    setSelected((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot],
    )
  }

  async function submit() {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await createSwapRequest({
        peerId: peer.id,
        swapType: offer.swapType,
        skillId,
        returnSkillId,
        note: note.trim() || null,
        proposedSlots: [...selected].sort(),
      })
      // Messages uses this state to open the right thread at the new request card.
      navigate('/messages', { state: { conversationId: result.conversationId, swapRequestId: result.swapRequest.id } })
    } catch (cause) {
      if (cause instanceof SlotTakenError) {
        // Reload so the picker shows what changed, and clear the choice so nothing stale is resent.
        setError('One of those times was just taken. Please pick again.')
        setSelected([])
        peerSlots.retry()
      } else {
        setError("We couldn't send your request. Please try again.")
      }
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title={`Request a swap with ${firstName}`} onClose={onClose} isLocked={isSubmitting}>
      {isOutOfCredits ? (
        <>
          <p className="mt-2 text-sm text-muted">
            This swap costs 1 credit and your balance is 0. Teach a one-hour session to earn a credit, or request a free 2-way swap.
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            {offer.creditCost === 0
              ? 'This swap is free. '
              : '1 credit is held in escrow until the session is complete. '}
            Pick up to {MAX_PROPOSED_SLOTS} times from {firstName}'s availability.
          </p>
          {offer.teachesYou.length > 1 && (
            <div className="mt-4">
              <SelectField
                label="Skill you want to learn"
                value={skillId}
                options={toOptions(peer.teachSkills, offer.teachesYou)}
                onChange={setSkillId}
              />
            </div>
          )}
          {returnSkillId && offer.learnsFromYou.length > 1 && (
            <div className="mt-4">
              <SelectField
                label="Skill you will teach"
                value={returnSkillId}
                options={toOptions(peer.learnSkills, offer.learnsFromYou)}
                onChange={setReturnSkillId}
              />
            </div>
          )}
          <SlotAvailability
            firstName={firstName}
            slots={peerSlots.data ?? []}
            status={peerSlots.status}
            onRetry={peerSlots.retry}
            selected={selected}
            max={MAX_PROPOSED_SLOTS}
            onToggle={toggleSlot}
          />
          <p className="mt-3 text-xs text-muted">Times shown in {getViewerTimezone()}.</p>
          <NoteField value={note} onChange={setNote} placeholder={`What would you like ${firstName} to know?`} />
          {error && (
            <div className="mt-4">
              <AlertBanner message={error} />
            </div>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={submit} disabled={selected.length === 0} isLoading={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send request'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
