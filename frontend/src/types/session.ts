import type { SwapType } from './match'
import type { User } from './user'

export type SessionStatus =
  | 'pending'
  | 'confirmed'
  // The end time has passed and the post-session drawer is waiting on an outcome.
  | 'awaiting_settlement'
  // The teacher marked a one-way session completed; the learner has 48 hours to confirm or dispute.
  | 'pending_learner_review'
  | 'completed'
  // A report, a dispute or a session nobody marked within 72 hours. A no-show report is checked against
  // the meeting records for 24 hours first; everything else goes straight to an admin.
  | 'disputed'
  // The 24-hour check or an admin found one member was absent.
  | 'no_show_confirmed'
  | 'cancelled'

// Meeting telemetry, one record per member. The backend fills it from the meeting provider's webhooks.
export interface AttendanceRecord {
  userId: string
  joinedAt: string
  // Null while the member is still in the meeting.
  leftAt: string | null
  // Total time in the meeting, shown to members and to an admin reviewing a dispute.
  durationMinutes: number
}

export interface SessionDispute {
  // Null when the 72-hour job opened it, not a member.
  raisedBy: string | null
  cause: 'no_show' | 'completion' | 'no_outcome'
  reason: string | null
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
  // Set with no_show_confirmed by the 24-hour check or an admin; reportedBy is null when nobody reported it.
  noShow?: { absentId: string; reportedBy: string | null }
  // When the teacher marked a one-way session completed, which starts the learner's 48-hour window.
  teacherMarkedAt?: string
  dispute?: SessionDispute
  cancellation?: { cancelledBy: string; reason: string; cancelledAt: string }
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
