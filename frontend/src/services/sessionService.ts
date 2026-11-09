import { CURRENT_USER_ID, mockConversations, mockReviews, mockSessions, mockSkills, mockUsers } from '../data/mockData'
import type { Session, SessionDetail, SessionStatus, UpcomingSession } from '../types'
import { getSessionEndMs } from '../utils/sessions'
import { mockRequest } from './mockClient'
import { runSessionChecks } from './sessionActions'

const getSkillName = (skillId: string | null) => mockSkills.find((skill) => skill.id === skillId)?.name

function withPartner(session: Session): UpcomingSession[] {
  const isTeaching = session.teacherId === CURRENT_USER_ID
  const partnerId = isTeaching ? session.learnerId : session.teacherId
  const partner = mockUsers.find((user) => user.id === partnerId)
  const skillName = getSkillName(session.skillId)
  return partner && skillName ? [{ ...session, partner, skillName, isTeaching }] : []
}

// Pending sessions stay out: their time isn't settled yet, so they live on the request card in Messages.
export function fetchMySessions(): Promise<SessionDetail[]> {
  runSessionChecks()
  const sessions = mockSessions
    .filter((session) => session.status !== 'pending' && [session.teacherId, session.learnerId].includes(CURRENT_USER_ID))
    .flatMap(withPartner)
    .map((session) => ({
      ...session,
      returnSkillName: getSkillName(session.returnSkillId) ?? null,
      conversationExists: mockConversations.some((item) => item.peerId === session.partner.id),
      hasMyReview: mockReviews.some((review) => review.sessionId === session.id && review.authorId === CURRENT_USER_ID),
    }))
  return mockRequest('my-sessions', structuredClone(sessions), [])
}

export function fetchUpcomingSessions(): Promise<UpcomingSession[]> {
  const upcoming = mockSessions
    .filter((session) => session.status === 'confirmed' && getSessionEndMs(session) > Date.now())
    .flatMap(withPartner)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  return mockRequest('sessions', upcoming, [])
}

// The soonest confirmed session with this peer, used to tell members they're already booked.
export function getNextSessionAt(peerId: string): string | null {
  const starts = mockSessions
    .filter(
      (session) =>
        session.status === 'confirmed' &&
        getSessionEndMs(session) > Date.now() &&
        [session.teacherId, session.learnerId].includes(peerId),
    )
    .map((session) => session.startsAt)
    .sort((a, b) => Date.parse(a) - Date.parse(b))
  return starts[0] ?? null
}

const LIVE_OR_COMPLETED: SessionStatus[] = ['confirmed', 'awaiting_settlement', 'pending_learner_review', 'disputed', 'completed']

// Keeps chat open: a cancelled session doesn't lock members who have another session or a finished one.
export const hasSessionHistoryWith = (peerId: string) =>
  mockSessions.some(
    (session) =>
      LIVE_OR_COMPLETED.includes(session.status) && [session.teacherId, session.learnerId].includes(peerId),
  )

export async function logAttendance(sessionId: string): Promise<{ joinedAt: string }> {
  const joinedAt = new Date().toISOString()
  await mockRequest('attendance', null)
  const session = mockSessions.find((item) => item.id === sessionId)
  // Only the first join counts: no-show checks need the earliest time, not the latest rejoin.
  const existing = session?.attendance.find((record) => record.userId === CURRENT_USER_ID)
  if (existing) return { joinedAt: existing.joinedAt }
  // Leaving is reported by the meeting provider, so the record stays open until then.
  session?.attendance.push({ userId: CURRENT_USER_ID, joinedAt, leftAt: null, durationMinutes: 0 })
  return { joinedAt }
}
