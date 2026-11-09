import { CURRENT_USER_ID, mockSessions, mockSlotHolds, mockUsers } from '../data/mockData'
import type { BusyTime, PeerSlot, SlotStatus, SwapRequest } from '../types'
import { getSessionEndMs } from '../utils/sessions'
import { classifySlots, getHoldExpiry, getSlotEnd, getUpcomingSlots, isHoldActive } from '../utils/timeSlots'
import { mockRequest } from './mockClient'

export function getMyConfirmedSessionTimes(now: number): BusyTime[] {
  return mockSessions
    .filter(
      (session) =>
        session.status === 'confirmed' &&
        getSessionEndMs(session) > now &&
        [session.teacherId, session.learnerId].includes(CURRENT_USER_ID),
    )
    .map(({ startsAt, durationMinutes }) => ({
      startsAt,
      endsAt: new Date(getSessionEndMs({ startsAt, durationMinutes })).toISOString(),
    }))
}

// A hold counts on both sides: a time someone proposed to me is one I may have to keep free too.
function getMyBusyTimes(now: number, ignoreRequestId?: string): BusyTime[] {
  const holds = mockSlotHolds
    .filter(
      (hold) =>
        [hold.holderId, hold.mentorId].includes(CURRENT_USER_ID) &&
        hold.requestId !== ignoreRequestId &&
        isHoldActive(hold, now),
    )
    .map(({ startsAt }) => ({ startsAt, endsAt: getSlotEnd(startsAt) }))
  return [...getMyConfirmedSessionTimes(now), ...holds]
}

// Locks every proposed time on a request, because the other member could accept any of them.
export function holdRequestTimes({ id, proposedSlots, lastProposedBy, requesterId, recipientId }: SwapRequest, now: number) {
  const mentorId = lastProposedBy === requesterId ? recipientId : requesterId
  for (const startsAt of proposedSlots) {
    mockSlotHolds.push({ mentorId, holderId: lastProposedBy, requestId: id, startsAt, status: 'on_hold', expiresAt: getHoldExpiry(startsAt, now) })
  }
}

// Splices rather than reassigns, because the array is shared through the mock data module.
export function releaseRequestHolds(requestId: string, keepStartsAt?: string) {
  for (let index = mockSlotHolds.length - 1; index >= 0; index -= 1) {
    const hold = mockSlotHolds[index]
    if (hold.requestId === requestId && hold.startsAt !== keepStartsAt) mockSlotHolds.splice(index, 1)
  }
}

// The peer is unavailable for times they hold on someone else too, not only times held on them.
const getPeerHolds = (peerId: string, ignoreRequestId?: string) =>
  mockSlotHolds.filter(
    (hold) => [hold.mentorId, hold.holderId].includes(peerId) && hold.requestId !== ignoreRequestId,
  )

// The real backend works this out behind GET /users/{id}/slots.
// A counter passes its request's ID, so that request's own holds don't block its new times.
export function getPeerSlots(peerId: string, now: number, ignoreRequestId?: string): PeerSlot[] {
  const peer = mockUsers.find((user) => user.id === peerId)
  if (!peer) return []
  const starts = getUpcomingSlots(peer.availability, now)
  return classifySlots(starts, getPeerHolds(peerId, ignoreRequestId), getMyBusyTimes(now, ignoreRequestId), now)
}

// For any time, including one outside the member's weekly hours.
export function getSlotStatus(peerId: string, startsAt: string, now: number, ignoreRequestId?: string): SlotStatus {
  const [slot] = classifySlots([startsAt], getPeerHolds(peerId, ignoreRequestId), getMyBusyTimes(now, ignoreRequestId), now)
  return slot.status
}

export const fetchSlotStatus = (peerId: string, startsAt: string, ignoreRequestId?: string): Promise<SlotStatus> =>
  mockRequest('custom-slot', getSlotStatus(peerId, startsAt, Date.now(), ignoreRequestId))

export const fetchPeerSlots = (peerId: string, ignoreRequestId?: string): Promise<PeerSlot[]> =>
  mockRequest('peer-slots', getPeerSlots(peerId, Date.now(), ignoreRequestId), [])
