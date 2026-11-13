import { useCallback, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncData } from '../../hooks/useAsyncData'
import { fetchPeerSlots } from '../../services/slotService'
import { createSwapRequest, SlotTakenError } from '../../services/swapRequestService'
import type { CreateSwapRequestResult, SwapOffer, TimeSlot, UserSkill } from '../../types'
import { getViewerTimezone, localSlotKey, slotKey } from '../../utils/availability'
import Button from '../common/Button'
import Modal from '../common/Modal'
import NoteField from '../common/NoteField'
import SelectField from '../common/SelectField'
import BookingSummary from './BookingSummary'
import { OutOfCreditsNotice } from './CreditCostSummary'
import SlotAvailability from './SlotAvailability'
import { useToast } from '../../hooks/useToast'

interface SwapRequestModalProps {
  offer: SwapOffer
  // Null when the wallet hasn't loaded; the server still rejects a request without credit.
  credits: number | null
  // An already-booked session with this peer, so booking again is a deliberate choice.
  existingSessionAt?: string | null
  // Weekly hours both members keep free, in the viewer's timezone, marked on the matching time chips.
  sharedSlots?: TimeSlot[]
  // A weekly hour tapped on the profile grid, picked for the member as soon as the open times load.
  initialSlot?: TimeSlot | null
  onClose: () => void
  // Set when the form opens inside that member's thread: there's nowhere to go, so the thread takes over.
  onSent?: (result: CreateSwapRequestResult) => void
}

const MAX_PROPOSED_SLOTS = 3

const toOptions = (skills: UserSkill[], ids: string[]) =>
  ids.map((id) => ({
    value: id,
    label: skills.find(({ skill }) => skill.id === id)?.skill.name ?? id,
  }))

export default function SwapRequestModal({ offer, credits, existingSessionAt = null, sharedSlots = [], initialSlot = null, onClose, onSent }: SwapRequestModalProps) {
  const navigate = useNavigate()
  const { peer } = offer
  const firstName = peer.name.split(' ')[0]
  const fetchSlots = useCallback(() => fetchPeerSlots(peer.id), [peer.id])
  const peerSlots = useAsyncData(fetchSlots)
  const [selected, setSelected] = useState<string[]>([])
  const [skillId, setSkillId] = useState(offer.teachesYou[0])
  const [returnSkillId, setReturnSkillId] = useState<string | null>(offer.learnsFromYou[0] ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const [note, setNote] = useState('')
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const hintId = useId()
  // Applies the tapped hour once, on the first load of open times; after that the member is in control.
  const [hasAppliedInitial, setHasAppliedInitial] = useState(initialSlot === null)
  if (!hasAppliedInitial && peerSlots.data) {
    setHasAppliedInitial(true)
    const match = peerSlots.data.find((slot) => slot.status === 'open' && localSlotKey(slot.startsAt) === slotKey(initialSlot as TimeSlot))
    if (match) setSelected([match.startsAt])
  }

  const isOutOfCredits = offer.creditCost === 1 && credits === 0
  const skillName = toOptions(peer.teachSkills, [skillId])[0].label
  const returnSkillName = returnSkillId ? toOptions(peer.learnSkills, [returnSkillId])[0].label : null

  function toggleSlot(slot: string) {
    setSelected((current) =>
      current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot],
    )
  }

  async function submit() {
    setIsSubmitting(true)
    try {
      const result = await createSwapRequest({
        peerId: peer.id,
        swapType: offer.swapType,
        skillId,
        returnSkillId,
        note: note.trim() || null,
        proposedSlots: [...selected].sort(),
      })
      toast.success(`Request sent to ${firstName}.`)
      if (onSent) return onSent(result)
      // Messages uses this state to open the right thread at the new request card.
      navigate('/messages', { state: { conversationId: result.conversationId, swapRequestId: result.swapRequest.id } })
    } catch (cause) {
      if (cause instanceof SlotTakenError) {
        // Reload so the picker shows what changed, and clear the choice so nothing stale is resent.
        toast.error('One of those times was just taken. Please pick again.')
        setSelected([])
        peerSlots.retry()
      } else {
        toast.error("We couldn't send your request. Please try again.")
      }
      setIsSubmitting(false)
    }
  }

  const footer = isOutOfCredits ? (
    <Button variant="secondary" onClick={onClose}>Close</Button>
  ) : (
    <>
      {/* Says why Send is unavailable, since a disabled button can't explain itself. */}
      {selected.length === 0 && <p id={hintId} className="order-last text-center text-xs text-muted sm:order-first sm:mr-auto sm:text-left">Pick a time to send.</p>}
      {/* On phones the stacked footer puts the send action first, within thumb reach; from sm it sits last. */}
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="order-2 sm:order-none">Cancel</Button>
      <Button className="order-1 sm:order-none" onClick={submit} disabled={selected.length === 0} isLoading={isSubmitting} aria-describedby={selected.length === 0 ? hintId : undefined}>
        {isSubmitting ? 'Sending…' : offer.creditCost === 1 ? 'Send request (1 credit)' : 'Send request'}
      </Button>
    </>
  )

  return (
    <Modal title={offer.creditCost === 1 ? `Request a session with ${firstName}` : `Request a swap with ${firstName}`} onClose={onClose} isLocked={isSubmitting} footer={footer}>
      {isOutOfCredits ? (
        <OutOfCreditsNotice onClose={onClose} />
      ) : (
        <>
          {/* Proposing several times can read as booking several sessions, so the outcome is said up front. */}
          <p className="mt-2 text-sm text-pretty text-muted">
            Propose up to {MAX_PROPOSED_SLOTS} times and {firstName} picks one: one session{offer.creditCost === 1 ? ', one credit' : ', free'}. Chat opens once a time is agreed.
          </p>
          <BookingSummary
            peer={peer}
            skillName={skillName}
            returnSkillName={returnSkillName}
            isCredit={offer.creditCost === 1}
            credits={credits}
            existingSessionAt={existingSessionAt}
          />
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
          {/* The instruction and the timezone sit directly on the picker they describe. */}
          <p className="mt-5 text-sm font-medium">
            Pick a day, then up to {MAX_PROPOSED_SLOTS} times. <span className="text-xs font-normal text-muted">Times in {getViewerTimezone()}.</span>
          </p>
          <SlotAvailability
            firstName={firstName}
            slots={peerSlots.data ?? []}
            status={peerSlots.status}
            onRetry={peerSlots.retry}
            selected={selected}
            max={MAX_PROPOSED_SLOTS}
            onToggle={toggleSlot}
            sharedSlots={sharedSlots}
          />
          {/* The note is optional, so it stays a single line until someone wants it. */}
          {isNoteOpen ? (
            <NoteField value={note} onChange={setNote} placeholder={`What would you like ${firstName} to know?`} />
          ) : (
            <button
              type="button"
              onClick={() => setIsNoteOpen(true)}
              className="mt-4 inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
            >
              + Add a note
            </button>
          )}
        </>
      )}
    </Modal>
  )
}
