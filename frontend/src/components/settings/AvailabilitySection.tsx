import type { SettingsUpdate } from '../../hooks/useSettingsForm'
import type { ProfileSettings, TimeSlot } from '../../types'
import { getViewerTimezone, slotKey, summarizeAvailability } from '../../utils/availability'
import AvailabilityPicker from '../schedule/AvailabilityPicker'

interface AvailabilitySectionProps {
  draft: ProfileSettings
  onChange: SettingsUpdate
}

export default function AvailabilitySection({ draft, onChange }: AvailabilitySectionProps) {
  const { slots } = draft.availability

  function setSlot(slot: TimeSlot, isSelected: boolean) {
    onChange((current) => {
      const others = current.availability.slots.filter((item) => slotKey(item) !== slotKey(slot))
      return { availability: { timezone: getViewerTimezone(), slots: isSelected ? [...others, slot] : others } }
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div>
        <AvailabilityPicker selected={slots} onSlotChange={setSlot} />
        <p className="mt-3 text-sm text-muted">Times shown in {getViewerTimezone()}.</p>
      </div>
      <aside className="space-y-3 rounded-xl border border-line bg-surface p-5 text-sm">
        <p className="font-semibold">{summarizeAvailability(slots)}</p>
        <p className="text-muted">Members book from these hours. After you save, your matches and open times update to match.</p>
        <p className="text-muted">Sessions and requests you already have keep their times.</p>
      </aside>
    </div>
  )
}
