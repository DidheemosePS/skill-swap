import type { SwapType } from './match'
import type { User } from './user'

export type SessionStatus =
  | 'pending'
  | 'confirmed'
  // The scheduled end has passed. The attendance records already say how it went; the credit moves 24 hours
  // after the end, or at once when both members confirm.
  | 'awaiting_settlement'
  | 'completed'
  // A member raised a concern during the 24-hour window; the credit stays held until an admin decides.
  | 'disputed'
  // One member never joined, by the attendance records or an admin's ruling.
  | 'no_show_confirmed'
  // Neither member joined: any credit goes back to the learner and both are marked absent.
  | 'mutual_no_show'
  | 'cancelled'

// What the attendance records say happened, decided automatically at the scheduled end.
export type SessionOutcome = 'completed' | 'no_show_teacher' | 'no_show_learner' | 'mutual_no_show'

// Meeting telemetry, one record per stretch in the call. The backend fills it from the video provider's
// webhooks; the browser never reports attendance.
export interface AttendanceRecord {
  userId: string
  joinedAt: string
  // Null while the member is still in the meeting.
  leftAt: string | null
  // Total time in the meeting, shown to members and to an admin reviewing a concern.
  durationMinutes: number
}

// A concern a member raised during the settle window. One kind only: the reason says what went wrong.
export interface SessionDispute {
  raisedBy: string
  reason: string
  raisedAt: string
}

export interface Session {
  id: string
  swapType: SwapType
  teacherId: string
  learnerId: string
  skillId: string
  // The skill the learner teaches back in a two-way swap; null for one-way.
  returnSkillId: string | null
  startsAt: string
  durationMinutes: 60
  status: SessionStatus
  // Null until the request is confirmed.
  meetingUrl: string | null
  attendance: AttendanceRecord[]
  // Members who pressed Confirm now while it was settling; once both have, it settles at once.
  confirmedBy: string[]
  // Set with no_show_confirmed: who wasn't there.
  noShow?: { absentId: string }
  dispute?: SessionDispute
  // late: called off after the 2-hour cutoff, which moves the credit and counts as an absence.
  cancellation?: { cancelledBy: string; reason: string; cancelledAt: string; late: boolean }
}

export interface Review {
  id: string
  sessionId: string
  authorId: string
  subjectId: string
  // Whole stars, 1-5.
  rating: number
  comment: string
  createdAt: string
}

export interface UpcomingSession extends Session {
  partner: User
  skillName: string
  isTeaching: boolean
}

// A session joined with everything the Sessions page shows, so it needs only one request.
export interface SessionDetail extends UpcomingSession {
  returnSkillName: string | null
  conversationExists: boolean
  hasMyReview: boolean
}

export interface ReviewDraft {
  rating: number
  comment: string
}

// A request whose time isn't agreed yet, shown on the Sessions agenda at its first proposed time.
export interface RequestedSession {
  requestId: string
  partner: User
  skillName: string
  swapType: SwapType
  isTeaching: boolean
  proposedSlots: string[]
  returnSkillName: string | null
  // When the request lapses unanswered; null once nothing can expire it.
  expiresAt: string | null
  // The member has to accept, suggest other times or decline.
  awaitingMe: boolean
}
