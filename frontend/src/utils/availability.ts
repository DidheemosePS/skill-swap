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

// "08:00": the same 24-hour form the profile grid and Sessions use for an hour.
export const formatHour = (startHour: number) => `${String(startHour).padStart(2, '0')}:00`

export const getViewerTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export function summarizeAvailability(slots: TimeSlot[]): string {
  if (slots.length === 0) return 'No hours selected yet'
  const days = WEEKDAYS.filter(({ id }) => slots.some((slot) => slot.day === id))
  const hours = slots.length === 1 ? '1 hour' : `${slots.length} hours`
  return `${hours} a week · ${days.map((day) => day.short).join(', ')}`
}

const WEEKDAY_BY_DAY_INDEX: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// A start time's weekday and hour in the viewer's own clock, comparable with weekly hours already
// converted to that clock (toViewerWeek), such as the "both free" hours on a profile.
export const localSlotKey = (iso: string) => {
  const date = new Date(iso)
  return slotKey({ day: WEEKDAY_BY_DAY_INDEX[date.getDay()], startHour: date.getHours() })
}
