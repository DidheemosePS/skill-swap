import InfoTip from '../common/InfoTip'
import type { SettingsUpdate } from '../../hooks/useSettingsForm'
import type { ProfileSettings, TimeSlot } from '../../types'
import { getViewerTimezone, slotKey, summarizeAvailability } from '../../utils/availability'
import AvailabilityPicker from '../schedule/AvailabilityPicker'
import SettingsPanel from './SettingsPanel'

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
    <SettingsPanel
      id="hours-heading"
      title="Weekly hours"
      hint={summarizeAvailability(slots)}
      aside={
        <span className="flex items-center gap-0.5 text-sm text-muted">
          {getViewerTimezone()}
          <InfoTip label="About your hours" align="end">
            Members book from these hours. Booked sessions keep their times.
          </InfoTip>
        </span>
      }
    >
      <AvailabilityPicker selected={slots} onSlotChange={setSlot} />
    </SettingsPanel>
  )
}
