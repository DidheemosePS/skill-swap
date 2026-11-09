import { mockMatches, mockUsers } from '../data/mockData'
import type { MatchRecommendation } from '../types'
import { hasPendingRequestWith } from './chatService'
import { mockRequest } from './mockClient'
import { getNextSessionAt } from './sessionService'

export function fetchMatches(): Promise<MatchRecommendation[]> {
  const recommendations = mockMatches.flatMap((match) => {
    const peer = mockUsers.find((user) => user.id === match.peerId)
    if (!peer) return []
    return [{ ...match, peer, hasPendingRequest: hasPendingRequestWith(peer.id), nextSessionAt: getNextSessionAt(peer.id) }]
  })
  recommendations.sort((a, b) => b.score - a.score)
  return mockRequest('matches', recommendations, [])
}
