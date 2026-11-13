import type { ExploreFilters } from '../../types'
import { DAY_OPTIONS, DEFAULT_FILTERS, RATING_OPTIONS, TYPE_OPTIONS } from '../../utils/exploreFilters'

interface ActiveFiltersProps {
  filters: ExploreFilters
  onChange: (changes: Partial<ExploreFilters>) => void
  onClearSearch: () => void
}

const labelOf = <T extends string>(options: { value: T; label: string }[], value: T) => options.find((option) => option.value === value)?.label ?? value

// What's narrowing the board, each removable on its own, so one tap undoes one choice.
export default function ActiveFilters({ filters, onChange, onClearSearch }: ActiveFiltersProps) {
  const chips = [
    filters.skill && { key: 'skill', label: `“${filters.skill}”`, remove: onClearSearch },
    filters.type !== DEFAULT_FILTERS.type && { key: 'type', label: labelOf(TYPE_OPTIONS, filters.type), remove: () => onChange({ type: DEFAULT_FILTERS.type }) },
    filters.day !== DEFAULT_FILTERS.day && { key: 'day', label: `Available ${labelOf(DAY_OPTIONS, filters.day)}`, remove: () => onChange({ day: DEFAULT_FILTERS.day }) },
    filters.rating !== DEFAULT_FILTERS.rating && { key: 'rating', label: labelOf(RATING_OPTIONS, filters.rating), remove: () => onChange({ rating: DEFAULT_FILTERS.rating }) },
    filters.reliable && { key: 'reliable', label: 'Reliable Swappers', remove: () => onChange({ reliable: false }) },
  ].filter((chip) => chip !== false && chip !== '')

  if (chips.length === 0) return null

  return (
    <ul aria-label="Active filters" className="flex flex-wrap gap-1.5 pt-3">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.remove}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full lg:min-h-9 bg-next-soft pr-2 pl-3 text-sm font-medium text-ink outline-none hover:bg-line focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span className={/\d/.test(chip.label) ? 'figures' : ''}>{chip.label}</span>
            <span className="sr-only">, remove filter</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="m4 4 8 8M12 4l-8 8" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
