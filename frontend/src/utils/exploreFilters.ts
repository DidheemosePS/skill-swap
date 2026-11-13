import type { ExploreDay, ExploreFilters, ExploreRating, ExploreSort, ExploreType } from '../types'
import { WEEKDAYS } from './availability'
import { cleanSkillName } from './skills'

export const DEFAULT_FILTERS: ExploreFilters = {
  skill: '',
  type: 'all',
  rating: 'any',
  day: 'any',
  sort: 'recommended',
  reliable: false,
}

export const TYPE_OPTIONS: { value: ExploreType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '2way', label: 'Free swap' },
  { value: '1way', label: 'With a credit' },
]

export const RATING_OPTIONS: { value: ExploreRating; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
]

export const DAY_OPTIONS: { value: ExploreDay; label: string }[] = [
  { value: 'any', label: 'Any' },
  ...WEEKDAYS.map((day) => ({ value: day.id, label: day.short })),
]

export const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rated', label: 'Highest rated' },
  { value: 'active', label: 'Most active' },
]

// Links can be shared or edited by hand, so an unknown value falls back to the default.
function readOption<T extends string>(
  params: URLSearchParams,
  key: string,
  options: { value: T }[],
  fallback: T,
): T {
  const match = options.find((option) => option.value === params.get(key))
  return match ? match.value : fallback
}

export function parseExploreFilters(params: URLSearchParams): ExploreFilters {
  return {
    skill: cleanSkillName(params.get('skill') ?? ''),
    type: readOption(params, 'type', TYPE_OPTIONS, DEFAULT_FILTERS.type),
    rating: readOption(params, 'rating', RATING_OPTIONS, DEFAULT_FILTERS.rating),
    day: readOption(params, 'day', DAY_OPTIONS, DEFAULT_FILTERS.day),
    sort: readOption(params, 'sort', SORT_OPTIONS, DEFAULT_FILTERS.sort),
    reliable: params.get('reliable') === '1',
  }
}

// Defaults are left out, which keeps shared links short, such as /explore?skill=python&type=2way.
export function serializeExploreFilters(filters: ExploreFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of ['skill', 'type', 'rating', 'day', 'sort'] as const) {
    if (filters[key] !== DEFAULT_FILTERS[key]) params.set(key, filters[key])
  }
  if (filters.reliable) params.set('reliable', '1')
  return params
}

// Filters set apart from sort and search, for the phone's "Filters · N" button.
// The deal is a visible switch of its own, so only the choices behind the Filters button are counted.
export const countFilters = ({ rating, day, reliable }: ExploreFilters) =>
  [rating !== 'any', day !== 'any', reliable].filter(Boolean).length
