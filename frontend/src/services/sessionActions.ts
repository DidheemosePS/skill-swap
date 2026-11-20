import { CURRENT_USER_ID, mockCurrentUser, mockReviews, mockSessions, mockTransactions, mockWallet } from '../data/mockData'
import type { ReviewDraft, Session, SessionStatus } from '../types'
import { getExpectedOutcome, getSessionEndMs, getSettlesAtMs } from '../utils/sessions'
import { mockRequest } from './mockClient'
import { expireLapsedRequests, refundIfPaid } from './swapRequestActions'

// The session's state changed since the page loaded. Maps to a 409 from the real API.
export class SessionClosedError extends Error {}

// Releases a one-way credit to the teacher. Exported for a learner's late cancel, which pays the teacher too.
export function payTeacher(session: Session, partnerId: string | null) {
  if (session.swapType !== 'one_way') return
  if (session.teacherId === CURRENT_USER_ID) {
    mockWallet.credits += 1
    mockTransactions.unshift({
      id: `tx-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      type: 'teaching_reward',
      partnerId,
      amount: 1,
      status: 'settled',
      sessionId: session.id,
    })
    return
  }
  // The current user paid: the credit leaves escrow for good, and only the mock's own wallet changes.
  const booking = mockTransactions.find((item) => item.sessionId === session.id && item.status === 'in_escrow')
  if (!booking) return
  booking.status = 'settled'
  mockWallet.escrowCredits -= 1
}

export const getPartnerId = ({ teacherId, learnerId }: Session) => (teacherId === CURRENT_USER_ID ? learnerId : teacherId)

const refund = (session: Session) => refundIfPaid({ swapType: session.swapType, learnerId: session.learnerId, sessionId: session.id })

// Applies the attendance outcome: both there completes it and pays the teacher; an absent teacher refunds the
// learner; an absent learner still pays the teacher; nobody there refunds and marks both absent.
function settle(session: Session) {
  const outcome = getExpectedOutcome(session)
  if (outcome === 'completed') {
    session.status = 'completed'
    payTeacher(session, getPartnerId(session))
    if (session.teacherId === CURRENT_USER_ID || session.returnSkillId) mockWallet.hoursTaught += 1
    if (session.learnerId === CURRENT_USER_ID || session.returnSkillId) mockWallet.hoursLearned += 1
    mockCurrentUser.completedSessions += 1
    return
  }
  if (outcome === 'mutual_no_show') {
    session.status = 'mutual_no_show'
    refund(session)
    return
  }
  session.status = 'no_show_confirmed'
  session.noShow = { absentId: outcome === 'no_show_teacher' ? session.teacherId : session.learnerId }
  if (outcome === 'no_show_teacher') refund(session)
  else payTeacher(session, getPartnerId(session))
}

// Stands in for the provider's leave webhook: anyone still in the room left when the session ended.
function closeAttendance(session: Session) {
  const endMs = getSessionEndMs(session)
  for (const record of session.attendance) {
    if (record.leftAt !== null) continue
    record.leftAt = new Date(endMs).toISOString()
    record.durationMinutes = Math.min(Math.max(Math.round((endMs - Date.parse(record.joinedAt)) / 60_000), 0), session.durationMinutes)
  }
}

// Stands in for the server's jobs: sessions that have ended start settling, and settle windows that have
// run out without a concern apply the attendance outcome.
export function runSessionChecks(now = Date.now()) {
  expireLapsedRequests(now)
  for (const session of mockSessions) {
    if (session.status === 'confirmed' && getSessionEndMs(session) <= now) {
      closeAttendance(session)
      session.status = 'awaiting_settlement'
    }
    if (session.status === 'awaiting_settlement' && getSettlesAtMs(session) <= now) settle(session)
  }
}

function getSession(sessionId: string, allowed: SessionStatus[]): Session {
  runSessionChecks()
  const session = mockSessions.find((item) => item.id === sessionId)
  if (!session || !allowed.includes(session.status)) throw new SessionClosedError()
  return session
}

// Confirm now: this member agrees with the outcome the attendance shows. Once both have, it settles at once
// instead of waiting out the 24 hours. Returns the session's status afterwards, so the caller can say which.
export async function completeSession(sessionId: string): Promise<SessionStatus> {
  await mockRequest('session-action', null)
  const session = getSession(sessionId, ['awaiting_settlement'])
  if (!session.confirmedBy.includes(CURRENT_USER_ID)) session.confirmedBy.push(CURRENT_USER_ID)
  if ([session.teacherId, session.learnerId].every((id) => session.confirmedBy.includes(id))) settle(session)
  return session.status
}

// Raise a concern: the credit stays held and an admin decides from the attendance records.
export async function raiseConcern(sessionId: string, reason: string): Promise<void> {
  await mockRequest('session-action', null)
  const session = getSession(sessionId, ['awaiting_settlement'])
  session.status = 'disputed'
  session.dispute = { raisedBy: CURRENT_USER_ID, reason, raisedAt: new Date().toISOString() }
}

export async function submitReview(sessionId: string, { rating, comment }: ReviewDraft): Promise<void> {
  await mockRequest('review', null)
  const session = getSession(sessionId, ['completed'])
  if (mockReviews.some((review) => review.sessionId === sessionId && review.authorId === CURRENT_USER_ID)) {
    throw new SessionClosedError()
  }
  mockReviews.push({
    id: `review-${crypto.randomUUID()}`,
    sessionId,
    authorId: CURRENT_USER_ID,
    subjectId: getPartnerId(session),
    rating,
    comment,
    createdAt: new Date().toISOString(),
  })
}
