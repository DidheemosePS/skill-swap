import type { ExploreDay, ExploreFilters, ExploreRating, ExploreSort, ExploreType } from '../types'
import { WEEKDAYS } from './availability'
import { cleanSkillName } from './skills'

export const DEFAULT_FILTERS: ExploreFilters = {
  skill: '',
  type: 'all',
  rating: 'any',
  day: 'any',
  sort: 'recommended',
}

export const TYPE_OPTIONS: { value: ExploreType; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: '2way', label: '2-way swap' },
  { value: '1way', label: '1-way credit' },
]

export const RATING_OPTIONS: { value: ExploreRating; label: string }[] = [
  { value: 'any', label: 'Any rating' },
  { value: '4', label: '⭐ 4.0+' },
  { value: '4.5', label: '⭐ 4.5+' },
]

export const DAY_OPTIONS: { value: ExploreDay; label: string }[] = [
  { value: 'any', label: 'Any day' },
  ...WEEKDAYS.map((day) => ({ value: day.id, label: day.long })),
]

export const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rated', label: 'Highest Rated' },
  { value: 'active', label: 'Most Active' },
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
  }
}

// Defaults are left out, which keeps shared links short, such as /explore?skill=python&type=2way.
export function serializeExploreFilters(filters: ExploreFilters): URLSearchParams {
  const params = new URLSearchParams()
  for (const key of ['skill', 'type', 'rating', 'day', 'sort'] as const) {
    if (filters[key] !== DEFAULT_FILTERS[key]) params.set(key, filters[key])
  }
  return params
}
