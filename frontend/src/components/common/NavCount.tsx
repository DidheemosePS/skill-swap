// A count on a nav link, in ink like the Messages list's unread count: red reads as an error, and
// orange is kept for held credits.
export default function NavCount({ value }: { value: number }) {
  if (value <= 0) return null
  return (
    <span aria-hidden="true" className="figures inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-semibold text-surface">
      {value > 9 ? '9+' : value}
    </span>
  )
}
