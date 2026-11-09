import { useCallback } from 'react'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { TimeProposal } from '../../hooks/useTimeProposal'
import { fetchPeerSlots } from '../../services/slotService'
import { getViewerTimezone } from '../../utils/availability'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Badge from '../common/Badge'
import CustomTimeField from './CustomTimeField'
import SlotAvailability from './SlotAvailability'

interface TimeProposalFieldsProps {
  peerId: string
  peerFirstName: string
  // A request whose own holds shouldn't count against its new times, and a stable ID for the field.
  ignoreId: string
  proposal: TimeProposal
  max: number
}

export default function TimeProposalFields({ peerId, peerFirstName, ignoreId, proposal, max }: TimeProposalFieldsProps) {
  const fetchSlots = useCallback(() => fetchPeerSlots(peerId, ignoreId), [peerId, ignoreId])
  const slots = useAsyncData(fetchSlots)
  const { listTimes, customTimes, allTimes } = proposal

  return (
    <>
      {/* Custom times share the limit, so they reduce how many listed times can still be picked. */}
      <SlotAvailability
        firstName={peerFirstName}
        slots={slots.data ?? []}
        status={slots.status}
        onRetry={slots.retry}
        selected={listTimes}
        max={max - customTimes.length}
        onToggle={proposal.toggleListTime}
      />
      <p className="mt-3 text-xs text-muted">Times shown in {getViewerTimezone()}.</p>
      <CustomTimeField
        peerId={peerId}
        requestId={ignoreId}
        isFull={allTimes.length >= max}
        selected={allTimes}
        onAdd={proposal.addCustomTime}
      />
      {customTimes.length > 0 && (
        <ul aria-label="Your suggested times" className="mt-3 flex flex-wrap gap-2">
          {customTimes.map((startsAt) => (
            <li key={startsAt}>
              <Badge label={formatSlotDateTime(startsAt)} onRemove={() => proposal.removeCustomTime(startsAt)} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
