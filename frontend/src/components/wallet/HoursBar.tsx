interface HoursBarProps {
  taught: number
  learned: number
  className?: string
  // On the dark balance card the bar and labels switch to light ink.
  onDark?: boolean
}

// What all the credits stand for: hours given and hours received, side by side on one bar.
export default function HoursBar({ taught, learned, className = '', onDark = false }: HoursBarProps) {
  const total = taught + learned
  if (total === 0) return null
  const strong = onDark ? 'text-white' : 'text-ink'
  return (
    <div className={className}>
      <div aria-hidden="true" className={`flex h-2 overflow-hidden rounded-full ${onDark ? 'bg-white/15' : 'bg-next-soft'}`}>
        <span className={onDark ? 'bg-white' : 'bg-next'} style={{ width: `${(taught / total) * 100}%` }} />
        <span className="flex-1 bg-[#6f9be0]" />
      </div>
      <p className={`mt-2 flex justify-between text-sm ${onDark ? 'text-white/70' : 'text-muted'}`}>
        <span><b className={`figures font-medium ${strong}`}>{taught} h</b> taught</span>
        <span><b className={`figures font-medium ${strong}`}>{learned} h</b> learned</span>
      </p>
    </div>
  )
}
