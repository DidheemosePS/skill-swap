import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { PeerSlot } from '../../types'
import AlertBanner from '../common/AlertBanner'
import Skeleton from '../common/Skeleton'
import TimeSlotPicker from './TimeSlotPicker'

interface SlotAvailabilityProps {
  firstName: string
  slots: PeerSlot[]
  status: AsyncStatus
  onRetry: () => void
  selected: string[]
  max: number
  onToggle: (slot: string) => void
}

export default function SlotAvailability({ firstName, slots, status, onRetry, selected, max, onToggle }: SlotAvailabilityProps) {
  // Times aren't offered until the check finishes, so a taken time can never be picked.
  if (status === 'loading') {
    return (
      <div role="status" aria-label="Loading available times" className="mt-5">
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="mt-5">
        <AlertBanner message="We couldn't load available times." onRetry={onRetry} />
      </div>
    )
  }
  if (slots.length === 0) {
    return (
      <p className="mt-5 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
        {firstName} has no times set for the next two weeks.
      </p>
    )
  }
  return (
    <>
      {slots.every((slot) => slot.status !== 'open') && (
        <p className="mt-5 rounded-lg bg-canvas p-3 text-sm text-muted">
          All of {firstName}'s times in the next two weeks are taken. Times on hold may open up again, so please check back later.
        </p>
      )}
      <div className="mt-5 max-h-[45vh] overflow-y-auto pr-1">
        <TimeSlotPicker slots={slots} selected={selected} max={max} onToggle={onToggle} />
      </div>
    </>
  )
}
