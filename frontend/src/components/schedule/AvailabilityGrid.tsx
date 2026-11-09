import type { WeeklyAvailability } from '../../types'
import { formatHour, GRID_HOURS, slotKey, WEEKDAYS } from '../../utils/availability'

interface AvailabilityGridProps {
  availability: WeeklyAvailability
}

// Read-only, so it's a plain table: there's nothing to focus, and screen readers can navigate it.
export default function AvailabilityGrid({ availability }: AvailabilityGridProps) {
  const selectedKeys = new Set(availability.slots.map(slotKey))
  return (
    <table className="w-full table-fixed border-separate border-spacing-1">
      <caption className="sr-only">Weekly availability in {availability.timezone}</caption>
      <thead>
        <tr>
          <th scope="col" className="w-12"><span className="sr-only">Time</span></th>
          {WEEKDAYS.map((day) => (
            <th key={day.id} scope="col" abbr={day.long} className="pb-1 text-xs font-semibold">
              {day.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {GRID_HOURS.map((startHour) => (
          <tr key={startHour}>
            <th scope="row" className="text-left text-xs font-normal whitespace-nowrap text-muted">
              {formatHour(startHour)}
            </th>
            {WEEKDAYS.map((day) => {
              const isAvailable = selectedKeys.has(slotKey({ day: day.id, startHour }))
              return (
                <td key={day.id} className={`h-6 rounded ${isAvailable ? 'bg-accent' : 'bg-line/60'}`}>
                  {isAvailable && <span className="sr-only">Available</span>}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
