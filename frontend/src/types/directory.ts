import type { Weekday } from './availability'
import type { SwapType } from './match'
import type { User } from './user'

export type ExploreType = 'all' | '2way' | '1way'
export type ExploreRating = 'any' | '4' | '4.5'
export type ExploreDay = 'any' | Weekday
export type ExploreSort = 'recommended' | 'rated' | 'active'

// Uses the same values as the URL and API, so a filter never needs translating between them.
export interface ExploreFilters {
  skill: string
  type: ExploreType
  rating: ExploreRating
  day: ExploreDay
  sort: ExploreSort
}

export interface DirectoryMember {
  user: User
  swapType: SwapType
  hasPendingRequest: boolean
  nextSessionAt: string | null
}
