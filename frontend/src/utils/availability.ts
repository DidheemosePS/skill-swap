import type { TimeSlot, Weekday } from '../types'

export const WEEKDAYS: { id: Weekday; short: string; long: string }[] = [
  { id: 'mon', short: 'Mon', long: 'Monday' },
  { id: 'tue', short: 'Tue', long: 'Tuesday' },
  { id: 'wed', short: 'Wed', long: 'Wednesday' },
  { id: 'thu', short: 'Thu', long: 'Thursday' },
  { id: 'fri', short: 'Fri', long: 'Friday' },
  { id: 'sat', short: 'Sat', long: 'Saturday' },
  { id: 'sun', short: 'Sun', long: 'Sunday' },
]

// Start hours offered in the grid: 8 AM through the 9 PM block.
export const GRID_HOURS = Array.from({ length: 14 }, (_, index) => index + 8)

export const slotKey = ({ day, startHour }: TimeSlot) => `${day}-${startHour}`

export function formatHour(startHour: number): string {
  const date = new Date(2000, 0, 1, startHour)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(date)
}

export const getViewerTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export function summarizeAvailability(slots: TimeSlot[]): string {
  if (slots.length === 0) return 'No hours selected yet'
  const days = WEEKDAYS.filter(({ id }) => slots.some((slot) => slot.day === id))
  const hours = slots.length === 1 ? '1 hour' : `${slots.length} hours`
  return `${hours} a week · ${days.map((day) => day.short).join(', ')}`
}
