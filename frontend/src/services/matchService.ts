import { CURRENT_USER_ID, mockMatches, mockSkills, mockUsers } from '../data/mockData'
import type { MatchRecommendation } from '../types'
import { getPendingRequest } from './chatService'
import { mockRequest } from './mockClient'
import { getNextSessionAt } from './sessionService'

export function fetchMatches(): Promise<MatchRecommendation[]> {
  const recommendations = mockMatches.flatMap((match) => {
    const peer = mockUsers.find((user) => user.id === match.peerId)
    if (!peer) return []
    const request = getPendingRequest(peer.id)
    const pendingRequestFrom: MatchRecommendation['pendingRequestFrom'] = request === null ? null : request.requesterId === CURRENT_USER_ID ? 'me' : 'them'
    // Enough to answer or withdraw the request from the dashboard row, without opening the chat.
    const pendingRequest = request && {
      id: request.id,
      proposedSlots: request.proposedSlots,
      skillName: mockSkills.find((skill) => skill.id === request.skillId)?.name ?? null,
      awaitingMe: request.lastProposedBy !== CURRENT_USER_ID,
    }
    return [{ ...match, peer, hasPendingRequest: request !== null, pendingRequestFrom, pendingRequest, nextSessionAt: getNextSessionAt(peer.id) }]
  })
  recommendations.sort((a, b) => b.score - a.score)
  return mockRequest('matches', recommendations, [])
}
