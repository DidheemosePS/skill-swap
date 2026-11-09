import type { User } from './user'

export type SwapType = 'two_way' | 'one_way'

export interface Match {
  id: string
  peerId: string
  swapType: SwapType
  // Match percentage, 0-100.
  score: number
  // Skills the peer can teach the current user.
  teachesYou: string[]
  // Skills the current user can teach the peer; empty for a one-way match.
  learnsFromYou: string[]
  // Two-way swaps are free; one-way swaps spend one credit.
  creditCost: 0 | 1
}

// What a member can do with this peer. Both the feed and the profile page book from this shape.
export interface SwapOffer {
  peer: User
  swapType: SwapType
  teachesYou: string[]
  learnsFromYou: string[]
  creditCost: 0 | 1
}

// A match joined with what its feed card shows, so the feed needs only one request.
export interface MatchRecommendation extends Match {
  peer: User
  hasPendingRequest: boolean
  nextSessionAt: string | null
}
