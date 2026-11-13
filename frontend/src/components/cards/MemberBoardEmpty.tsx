import { useNearMisses } from '../../hooks/useNearMisses'
import type { NearMiss } from '../../hooks/useNearMisses'
import type { ExploreFilters } from '../../types'
import { DAY_OPTIONS, DEFAULT_FILTERS, RATING_OPTIONS, TYPE_OPTIONS } from '../../utils/exploreFilters'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'

interface MemberBoardEmptyProps {
  filters: ExploreFilters
  onChange: (changes: Partial<ExploreFilters>) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

const labelOf = <T extends string>(options: { value: T; label: string }[], value: T) => options.find((option) => option.value === value)?.label ?? value

// How each filter is named in a "remove … to see N" suggestion.
function filterName(key: NearMiss['key'], filters: ExploreFilters) {
  if (key === 'type') return labelOf(TYPE_OPTIONS, filters.type)
  if (key === 'day') return `Available ${labelOf(DAY_OPTIONS, filters.day)}`
  if (key === 'rating') return labelOf(RATING_OPTIONS, filters.rating)
  return 'Reliable Swappers'
}

// Names the cause: a skill nobody teaches, or the one filter that ruled everyone out, with a one-tap way back.
export default function MemberBoardEmpty({ filters, onChange, hasActiveFilters, onClearFilters }: MemberBoardEmptyProps) {
  const search = filters.skill
  const hasOtherFilters = filters.type !== 'all' || filters.day !== 'any' || filters.rating !== 'any' || filters.reliable
  const misses = useNearMisses(filters, hasOtherFilters)

  if (!hasActiveFilters) return <EmptyState icon="people" title="No members yet" description="New members will appear here as they join." />
  if (search && !hasOtherFilters) {
    return (
      <EmptyState
        icon="search"
        title={`No one teaches “${search}” yet`}
        description="Try another skill, or clear the search to see everyone."
        action={<Button variant="secondary" onClick={onClearFilters}>Clear search</Button>}
      />
    )
  }

  return (
    <EmptyState
      icon="search"
      stacked
      title={search ? `No one teaches “${search}” with these filters` : 'No members match these filters'}
      description={misses === null ? 'Checking which filter rules everyone out…' : misses.length > 0 ? 'Removing one of these brings members back:' : 'Remove a filter above, or clear them all.'}
      action={
        <div className="flex flex-col items-center gap-2">
          {(misses ?? []).map((miss) => (
            <Button key={miss.key} variant="secondary" onClick={() => onChange({ [miss.key]: DEFAULT_FILTERS[miss.key] })}>
              {/* One span, so the button's flex gap doesn't split the sentence around the number. */}
              <span>Remove “{filterName(miss.key, filters)}” to see <span className="figures">{miss.count}</span> {miss.count === 1 ? 'member' : 'members'}</span>
            </Button>
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear all filters
          </button>
        </div>
      }
    />
  )
}
