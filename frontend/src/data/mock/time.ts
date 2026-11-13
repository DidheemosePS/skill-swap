const MINUTE_MS = 60_000

interface Offset {
  days?: number
  hours?: number
  minutes?: number
}

// Mock dates are relative to now so countdowns and the 10-minute join window always work.
export function fromNow({ days = 0, hours = 0, minutes = 0 }: Offset): string {
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes
  const ms = Date.now() + totalMinutes * MINUTE_MS
  // Times an hour or more away land on the hour, like real bookings, so they don't drift on every reload;
  // minute-scale offsets stay exact so the "starts in 8 minutes" demo and its join window still behave.
  return new Date(Math.abs(totalMinutes) < 60 ? ms : Math.round(ms / (60 * MINUTE_MS)) * 60 * MINUTE_MS).toISOString()
}

const WEEKDAY_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 } as const

// The next given weekday at an hour (UTC, the mock members' timezone), at least a day ahead, so a booked
// session lands inside the weekly hours its members show on their profiles.
export function nextWeekly(day: keyof typeof WEEKDAY_INDEX, hour: number): string {
  const date = new Date()
  date.setUTCHours(hour, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + 1)
  while (date.getUTCDay() !== WEEKDAY_INDEX[day]) date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString()
}
