import type { MatchRecommendation } from '../types'

// Booked or requested: the dashboard lists these under Your sessions & requests, not as new matches.
export const isInProgress = (match: MatchRecommendation) => match.hasPendingRequest || match.nextSessionAt !== null
