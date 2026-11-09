export type SlotStatus = 'open' | 'on_hold' | 'booked' | 'your_session'

export interface PeerSlot {
  startsAt: string
  status: SlotStatus
}

// A stretch of time when the current user can't take another session.
export interface BusyTime {
  startsAt: string
  endsAt: string
}

// A lock on one of a mentor's times, so two members can't claim it at once.
export interface SlotHold {
  mentorId: string
  holderId: string
  startsAt: string
  status: 'on_hold' | 'booked'
  // The request that placed this hold, so answering the request can release it.
  requestId?: string
  // Null for a booked time, which doesn't lapse.
  expiresAt: string | null
}
