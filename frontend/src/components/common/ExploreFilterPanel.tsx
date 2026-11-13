import type { ExploreFilters } from '../../types'
import { DAY_OPTIONS, RATING_OPTIONS } from '../../utils/exploreFilters'
import FilterChips from './FilterChips'

interface ExploreFilterPanelProps {
  filters: ExploreFilters
  onChange: (changes: Partial<ExploreFilters>) => void
  hasActiveFilters: boolean
  onClear: () => void
}

// The narrowing filters as chips: a popover under the Filters button on desktop, a drawer on phones.
export default function ExploreFilterPanel({ filters, onChange, hasActiveFilters, onClear }: ExploreFilterPanelProps) {
  return (
    <div className="space-y-5">
      <FilterChips label="Available on" value={filters.day} options={DAY_OPTIONS} onChange={(day) => onChange({ day })} />
      <FilterChips label="Rating" value={filters.rating} options={RATING_OPTIONS} onChange={(rating) => onChange({ rating })} />
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          checked={filters.reliable}
          onChange={(event) => onChange({ reliable: event.target.checked })}
          className="size-4.5 accent-accent"
        />
        Reliable Swappers only
      </label>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 items-center rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
