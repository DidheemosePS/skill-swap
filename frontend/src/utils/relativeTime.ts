const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

export function formatRelativeTime(iso: string, now: number): string {
  const elapsed = now - Date.parse(iso)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (elapsed >= size) return formatter.format(-Math.floor(elapsed / size), unit)
  }
  return 'just now'
}
