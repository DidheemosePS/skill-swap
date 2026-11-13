import { CURRENT_USER_ID, mockCurrentUser, mockReviews, mockUsers } from '../data/mockData'
import type { MemberProfile, ProfileReview, User } from '../types'
import { hasPendingRequestWith } from './chatService'
import { getSwapOffer } from './memberService'
import { mockRequest } from './mockClient'
import { getNextSession } from './sessionService'

const allMembers = (): User[] => [mockCurrentUser, ...mockUsers]

function getReviews(subjectId: string): ProfileReview[] {
  return mockReviews
    .filter((review) => review.subjectId === subjectId)
    .flatMap((review) => {
      const author = allMembers().find((member) => member.id === review.authorId)
      return author ? [{ ...review, author }] : []
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

// Null means no such member, which the page shows differently from a failed request.
export function fetchMemberProfile(id: string): Promise<MemberProfile | null> {
  const user = allMembers().find((member) => member.id === id)
  const nextSession = user && user.id !== CURRENT_USER_ID ? getNextSession(user.id) : null
  const profile: MemberProfile | null = user
    ? {
        ...getSwapOffer(user),
        isSelf: user.id === CURRENT_USER_ID,
        hasPendingRequest: hasPendingRequestWith(user.id),
        nextSessionAt: nextSession?.startsAt ?? null,
        nextSession: nextSession && { id: nextSession.id, startsAt: nextSession.startsAt, durationMinutes: nextSession.durationMinutes, meetingUrl: nextSession.meetingUrl },
        reviews: getReviews(user.id),
        viewerAvailability: user.id === CURRENT_USER_ID ? null : mockCurrentUser.availability,
      }
    : null
  return mockRequest('profile', profile, null)
}
