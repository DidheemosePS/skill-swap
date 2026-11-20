// A count on a nav link, in ink like the Messages list's unread count: red reads as an error, and
// orange is kept for held credits.
// tone 'board' is the coral badge for the ultramarine bar, where an ink circle would sink into the blue.
export default function NavCount({ value, tone = 'ink' }: { value: number; tone?: 'ink' | 'board' }) {
  if (value <= 0) return null
  return (
    <span aria-hidden="true" className={`figures inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold ${tone === 'board' ? 'bg-coral text-ink' : 'bg-ink text-surface'}`}>
      {value > 9 ? '9+' : value}
    </span>
  )
}
