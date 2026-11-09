import type { PeerSlot, SlotStatus } from '../../types'
import { formatSlotDay, formatSlotTime } from '../../utils/timeSlots'

interface TimeSlotPickerProps {
  slots: PeerSlot[]
  selected: string[]
  max: number
  onToggle: (slot: string) => void
}

const STATUS_LABELS: Partial<Record<SlotStatus, string>> = {
  on_hold: 'On hold',
  booked: 'Booked',
  your_session: 'Your session',
}

function groupByDay(slots: PeerSlot[]) {
  const groups = new Map<string, PeerSlot[]>()
  for (const slot of slots) {
    const day = formatSlotDay(slot.startsAt)
    groups.set(day, [...(groups.get(day) ?? []), slot])
  }
  return [...groups.entries()]
}

const BASE_CLASSES =
  'min-h-10 rounded-md border px-3 text-sm font-medium tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1'

function getChipClasses(isUnavailable: boolean, isSelected: boolean) {
  // Taken times stay readable (no fading), because they tell members to try another week.
  if (isUnavailable) return `${BASE_CLASSES} cursor-not-allowed border-dashed border-line bg-canvas text-muted`
  if (isSelected) return `${BASE_CLASSES} border-accent bg-accent text-white`
  return `${BASE_CLASSES} border-line bg-surface hover:enabled:bg-canvas disabled:cursor-not-allowed disabled:opacity-50`
}

export default function TimeSlotPicker({ slots, selected, max, onToggle }: TimeSlotPickerProps) {
  const isFull = selected.length >= max
  return (
    <div className="space-y-4">
      {groupByDay(slots).map(([day, daySlots]) => (
        <div key={day} role="group" aria-label={day}>
          <h3 className="text-xs font-semibold text-muted">{day}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {daySlots.map((slot) => {
              const isSelected = selected.includes(slot.startsAt)
              const unavailableLabel = STATUS_LABELS[slot.status]
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={Boolean(unavailableLabel) || (isFull && !isSelected)}
                  onClick={() => onToggle(slot.startsAt)}
                  className={getChipClasses(Boolean(unavailableLabel), isSelected)}
                >
                  {formatSlotTime(slot.startsAt)}
                  {unavailableLabel && ` · ${unavailableLabel}`}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
