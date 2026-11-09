import type { SlotHold } from '../../types'
import { getHoldExpiry, getUpcomingSlots } from '../../utils/timeSlots'
import { mockMessages } from './chats'
import { fromNow } from './time'
import { mockUsers } from './users'

const OTHER_MEMBER_ID = 'user-other-member'
const loadedAt = Date.now()

// Other members' activity, placed on each mentor's real upcoming times so it shows in the picker.
// These start past the current user's mock sessions, whose "Your session" label would otherwise win.
const otherMembersHolds: SlotHold[] = mockUsers.flatMap((mentor) => {
  const starts = getUpcomingSlots(mentor.availability, loadedAt).filter((start) => start > fromNow({ days: 5 }))
  const base = { mentorId: mentor.id, holderId: OTHER_MEMBER_ID }
  return [
    { ...base, startsAt: starts[0], status: 'on_hold' as const, expiresAt: getHoldExpiry(starts[0], loadedAt) },
    { ...base, startsAt: starts[1], status: 'booked' as const, expiresAt: null },
    // Already lapsed, so this time should read as open.
    { ...base, startsAt: starts[2], status: 'on_hold' as const, expiresAt: fromNow({ hours: -1 }) },
  ].filter((hold) => hold.startsAt)
})

// Requests in the chat fixtures lock their times just as newly sent ones do.
const ownRequestHolds: SlotHold[] = mockMessages.flatMap((message) => {
  if (message.kind !== 'swap_request' || message.swapRequest.status !== 'pending') return []
  const { id, requesterId, recipientId, proposedSlots } = message.swapRequest
  return proposedSlots.map((startsAt) => ({
    mentorId: recipientId,
    holderId: requesterId,
    requestId: id,
    startsAt,
    status: 'on_hold' as const,
    expiresAt: getHoldExpiry(startsAt, loadedAt),
  }))
})

export const mockSlotHolds: SlotHold[] = [...otherMembersHolds, ...ownRequestHolds]
