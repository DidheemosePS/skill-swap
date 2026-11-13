import type { Weekday } from './availability'
import type { SwapType } from './match'
import type { User } from './user'

// Mirrors the board's two sections: free swaps, and learning with a credit.
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
  // Reliable Swappers only.
  reliable: boolean
}

// The deal a member offers the current user, which groups the Explore board.
export type ExploreDeal = 'free' | 'credit'

export interface DirectoryMember {
  user: User
  swapType: SwapType
  // Which board section the member sits in. Fixed per member, so the label never changes with a search.
  deal: ExploreDeal
  hasPendingRequest: boolean
  nextSessionAt: string | null
  // Skill ids in common with the current user, so the board can mark them and group by deal.
  teachesYou: string[]
  learnsFromYou: string[]
}
