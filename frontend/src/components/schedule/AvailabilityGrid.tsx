import type { TimeSlot, WeeklyAvailability } from '../../types'
import { GRID_HOURS, slotKey, WEEKDAYS } from '../../utils/availability'

interface AvailabilityGridProps {
  availability: WeeklyAvailability
  // The viewer's own hours, overlaid so shared times stand out. Their name labels the other member's cells.
  overlay?: { availability: WeeklyAvailability; theirName: string }
  // Makes each both-free cell a button that starts a booking at that weekly hour.
  onPick?: (slot: TimeSlot) => void
}

type CellState = 'both' | 'theirs' | 'yours' | 'none'

// Three states that differ in shape as well as colour: near-black with a white dot where both
// are free, solid grey where only they are, a dashed grey outline where only the viewer is.
const CELL: Record<CellState, string> = {
  both: 'bg-next',
  theirs: 'bg-muted/45',
  yours: 'outline-[1.5px] outline-dashed -outline-offset-2 outline-muted',
  none: 'bg-next-soft',
}

const clock = (hour: number) => `${String(hour).padStart(2, '0')}:00`

// Rows to draw: each hour either member uses, with every run of empty hours folded into one row.
function buildRows(hours: number[], isUsed: (hour: number) => boolean) {
  const rows: ({ kind: 'hour'; hour: number } | { kind: 'gap'; from: number; to: number })[] = []
  for (let index = 0; index < hours.length; index += 1) {
    const hour = hours[index]
    if (isUsed(hour)) {
      rows.push({ kind: 'hour', hour })
      continue
    }
    let end = index
    while (end + 1 < hours.length && !isUsed(hours[end + 1])) end += 1
    rows.push({ kind: 'gap', from: hour, to: hours[end] })
    index = end
  }
  return rows
}

// Read-only, so it's a plain table: there's nothing to focus, and screen readers can navigate it.
export default function AvailabilityGrid({ availability, overlay, onPick }: AvailabilityGridProps) {
  const theirKeys = new Set(availability.slots.map(slotKey))
  const yourKeys = new Set(overlay?.availability.slots.map(slotKey) ?? [])
  const usedHours = new Set([...availability.slots, ...(overlay?.availability.slots ?? [])].map((slot) => slot.startHour))
  // The grid keeps to the hours in use, with empty runs folded, so it stays short enough to scan.
  const hours = usedHours.size > 0 ? GRID_HOURS.filter((hour) => hour >= Math.min(...usedHours) && hour <= Math.max(...usedHours)) : GRID_HOURS
  const rows = buildRows(hours, (hour) => usedHours.has(hour))

  return (
    <table className="w-full table-fixed border-separate border-spacing-1">
      <caption className="sr-only">
        {overlay ? `When you and ${overlay.theirName} are free each week` : 'Weekly availability'}, in {availability.timezone}
      </caption>
      <thead>
        <tr>
          <th scope="col" className="w-14"><span className="sr-only">Time</span></th>
          {WEEKDAYS.map((day) => (
            <th key={day.id} scope="col" abbr={day.long} className="pb-1 text-xs font-semibold">
              {day.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) =>
          row.kind === 'gap' ? (
            <tr key={`gap-${row.from}`}>
              {/* The range would overflow the hour column, so it reads inside the band: "12:00–18:00 · Neither free". */}
              <th scope="row" className="sr-only">{row.from === row.to ? clock(row.from) : `${clock(row.from)} to ${clock(row.to + 1)}`}</th>
              <td colSpan={8} className="h-6 rounded border border-dashed border-line text-center text-xs text-muted">
                <span className="figures">{row.from === row.to ? clock(row.from) : `${clock(row.from)}–${clock(row.to + 1)}`}</span> · {overlay ? 'Neither free' : 'Not available'}
              </td>
            </tr>
          ) : (
            <tr key={row.hour}>
              <th scope="row" className="figures text-left text-xs font-normal whitespace-nowrap text-muted">{clock(row.hour)}</th>
              {WEEKDAYS.map((day) => {
                const key = slotKey({ day: day.id, startHour: row.hour })
                const isTheirs = theirKeys.has(key)
                const isYours = yourKeys.has(key)
                const state: CellState = isTheirs && isYours ? 'both' : isTheirs ? 'theirs' : isYours ? 'yours' : 'none'
                const label = { both: 'Both free', theirs: overlay ? `Only ${overlay.theirName} free` : 'Available', yours: 'Only you free', none: 'Neither free' }[state]
                const dot = <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-white" />
                return (
                  <td key={day.id} className={`relative h-6 rounded ${CELL[state]}`}>
                    {state === 'both' && onPick ? (
                      // The cell is the shortcut: tapping it opens the booking with this hour already picked.
                      <button
                        type="button"
                        onClick={() => onPick({ day: day.id, startHour: row.hour })}
                        className="absolute inset-0 rounded outline-none hover:ring-2 hover:ring-next/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        {dot}
                        <span className="sr-only">Book {day.long} {clock(row.hour)}, both free</span>
                      </button>
                    ) : (
                      <>
                        {state === 'both' && dot}
                        <span className="sr-only">{label}</span>
                      </>
                    )}
                  </td>
                )
              })}
            </tr>
          ),
        )}
      </tbody>
    </table>
  )
}
