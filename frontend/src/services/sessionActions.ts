import { CURRENT_USER_ID, mockCurrentUser, mockReviews, mockSessions, mockTransactions, mockWallet } from '../data/mockData'
import type { ReviewDraft, Session, SessionDispute, SessionStatus } from '../types'
import { getAutoResolveEndMs, getReviewWindowEndMs, getSessionEndMs, getVerificationEndMs, releasesCreditNow } from '../utils/sessions'
import { mockRequest } from './mockClient'
import { expireLapsedRequests, refundIfPaid } from './swapRequestActions'

// The session's state changed since the page loaded. Maps to a 409 from the real API.
export class SessionClosedError extends Error {}

function payTeacher(session: Session, partnerId: string | null) {
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

function recordCompleted(session: Session) {
  session.status = 'completed'
  payTeacher(session, getPartnerId(session))
  if (session.teacherId === CURRENT_USER_ID || session.returnSkillId) mockWallet.hoursTaught += 1
  if (session.learnerId === CURRENT_USER_ID || session.returnSkillId) mockWallet.hoursLearned += 1
  mockCurrentUser.completedSessions += 1
}

// Anything other than a confirmation or a lapsed review window goes to review. The credit stays in
// escrow, and the meeting records are kept as evidence.
function openDispute(session: Session, dispute: Omit<SessionDispute, 'raisedAt'>) {
  session.status = 'disputed'
  session.dispute = { ...dispute, raisedAt: new Date().toISOString() }
}

// Ends a no-show report's 24-hour check. A reported member with no meeting record never joined, so the
// report stands. One who did join stays disputed for an admin, since a short visit can't be judged here.
function verifyNoShow(session: Session, reportedBy: string) {
  const absentId = reportedBy === session.teacherId ? session.learnerId : session.teacherId
  if (session.attendance.some((record) => record.userId === absentId)) return
  session.status = 'no_show_confirmed'
  session.noShow = { absentId, reportedBy }
  // An absent teacher earns nothing, so the learner gets the credit back. An absent learner still pays.
  if (absentId === session.teacherId) refundIfPaid({ swapType: session.swapType, learnerId: session.learnerId, sessionId: session.id })
  else payTeacher(session, getPartnerId(session))
}

// Stands in for the meeting provider's leave webhook: anyone still in the room left when the session ended.
function closeAttendance(session: Session) {
  const endMs = getSessionEndMs(session)
  for (const record of session.attendance) {
    if (record.leftAt !== null) continue
    record.leftAt = new Date(endMs).toISOString()
    record.durationMinutes = Math.min(Math.max(Math.round((endMs - Date.parse(record.joinedAt)) / 60_000), 0), session.durationMinutes)
  }
}

// Stands in for server jobs: sessions that have ended, and review, 72-hour and no-show windows that have run out.
export function runSessionChecks(now = Date.now()) {
  expireLapsedRequests(now)
  for (const session of mockSessions) {
    if (session.status === 'confirmed' && getSessionEndMs(session) <= now) {
      closeAttendance(session)
      session.status = 'awaiting_settlement'
    }
    // The learner stayed silent for 48 hours, so the teacher gets paid even if they never log back in.
    if (session.status === 'pending_learner_review' && session.teacherMarkedAt && getReviewWindowEndMs(session.teacherMarkedAt) <= now) {
      recordCompleted(session)
    }
    // Nobody marked an outcome, so an admin decides instead of the credit staying locked forever.
    if (session.status === 'awaiting_settlement' && getAutoResolveEndMs(session) <= now) {
      openDispute(session, { raisedBy: null, cause: 'no_outcome', reason: null })
    }
    const { dispute } = session
    if (session.status === 'disputed' && dispute?.cause === 'no_show' && dispute.raisedBy && getVerificationEndMs(dispute.raisedAt) <= now) {
      verifyNoShow(session, dispute.raisedBy)
    }
  }
}

function getSession(sessionId: string, allowed: SessionStatus[]): Session {
  runSessionChecks()
  const session = mockSessions.find((item) => item.id === sessionId)
  if (!session || !allowed.includes(session.status)) throw new SessionClosedError()
  return session
}

// The caller decides the result: a learner's word releases the credit at once, while a teacher's
// marking only opens the learner's 48-hour window. A teacher can't answer their own marking.
export async function completeSession(sessionId: string): Promise<void> {
  await mockRequest('session-action', null)
  const session = getSession(sessionId, ['awaiting_settlement', 'pending_learner_review'])
  if (releasesCreditNow(session, CURRENT_USER_ID)) {
    recordCompleted(session)
    return
  }
  if (session.status === 'pending_learner_review') throw new SessionClosedError()
  session.status = 'pending_learner_review'
  session.teacherMarkedAt = new Date().toISOString()
}

export async function reportNoShow(sessionId: string): Promise<void> {
  await mockRequest('session-action', null)
  const session = getSession(sessionId, ['awaiting_settlement'])
  openDispute(session, { raisedBy: CURRENT_USER_ID, cause: 'no_show', reason: null })
}

// The learner disputes the teacher's marking. Only the learner can, so it maps to a 403 otherwise.
export async function disputeCompletion(sessionId: string, reason: string): Promise<void> {
  await mockRequest('session-action', null)
  const session = getSession(sessionId, ['pending_learner_review'])
  if (session.learnerId !== CURRENT_USER_ID) throw new SessionClosedError()
  openDispute(session, { raisedBy: CURRENT_USER_ID, cause: 'completion', reason })
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
