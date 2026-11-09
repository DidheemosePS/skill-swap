const MINUTE_MS = 60_000

interface Offset {
  days?: number
  hours?: number
  minutes?: number
}

// Mock dates are relative to now so countdowns and the 10-minute join window always work.
export function fromNow({ days = 0, hours = 0, minutes = 0 }: Offset): string {
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes
  return new Date(Date.now() + totalMinutes * MINUTE_MS).toISOString()
}
