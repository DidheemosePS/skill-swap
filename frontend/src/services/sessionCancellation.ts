import { CURRENT_USER_ID, mockMessages, mockSessions, mockTransactions } from '../data/mockData'
import type { Message, Session, SwapRequestMessage } from '../types'
import { canOfferAlternatives } from '../utils/sessions'
import { getCustomSlotError } from '../utils/timeSlots'
import { emitChatEvent } from './chatSocket'
import { mockRequest } from './mockClient'
import { getPartnerId, runSessionChecks, SessionClosedError } from './sessionActions'
import { getSlotStatus, holdRequestTimes, releaseRequestHolds } from './slotService'
import { confirmRequest, isRequestMessage, publish, refundIfPaid } from './swapRequestActions'
import { getOrCreateConversation, getRequestExpiry, SlotTakenError } from './swapRequestService'

const MOCK_PEER_ANSWER_MS = 4000

// New times from the member who called off a session, in the same thread as the old request.
function offerAlternatives(session: Session, actorId: string, recipientId: string, alternatives: string[], reason: string, now: string) {
  const conversation = getOrCreateConversation(actorId === CURRENT_USER_ID ? recipientId : actorId, now)
  const sessionId = `session-${crypto.randomUUID()}`
  const message: SwapRequestMessage = {
    id: `msg-${crypto.randomUUID()}`,
    conversationId: conversation.id,
    senderId: actorId,
    sentAt: now,
    kind: 'swap_request',
    swapRequest: {
      id: `request-${crypto.randomUUID()}`,
      swapType: session.swapType,
      requesterId: actorId,
      recipientId,
      teacherId: session.teacherId,
      learnerId: session.learnerId,
      skillId: session.skillId,
      returnSkillId: session.returnSkillId,
      // The reason travels with the new times, so the other member reads why on the request itself.
      note: reason,
      counterNote: null,
      proposedSlots: alternatives,
      lastProposedBy: actorId,
      status: 'pending',
      confirmedStartsAt: null,
      cancelledBy: null,
      cancelReason: null,
      hasAlternatives: false,
      expiresAt: getRequestExpiry(alternatives, Date.now()),
      meetingUrl: null,
      sessionId,
    },
  }
  mockMessages.push(message)
  mockSessions.push({ ...session, id: sessionId, startsAt: alternatives[0], status: 'pending', meetingUrl: null, attendance: [], cancellation: undefined })
  holdRequestTimes(message.swapRequest, Date.now())
  // The escrowed credit follows the new request, so accepting doesn't charge it twice.
  const booking = mockTransactions.find((item) => item.sessionId === session.id && item.status === 'in_escrow')
  if (booking) booking.sessionId = sessionId
  return message
}

// Exported with an actor so the mock can also show the other member calling off a session.
export function cancelSessionAs(sessionId: string, actorId: string, reason: string, alternatives: string[]) {
  const now = new Date().toISOString()
  const session = mockSessions.find((item) => item.id === sessionId)
  if (!session || session.status !== 'confirmed' || Date.parse(session.startsAt) <= Date.now()) throw new SessionClosedError()
  const otherId = session.teacherId === actorId ? session.learnerId : session.teacherId
  session.status = 'cancelled'
  session.cancellation = { cancelledBy: actorId, reason, cancelledAt: now }

  const requestMessage = mockMessages.filter(isRequestMessage).find((item) => item.swapRequest.sessionId === sessionId)
  if (requestMessage) {
    const { swapRequest } = requestMessage
    swapRequest.status = 'cancelled'
    swapRequest.cancelledBy = actorId
    swapRequest.cancelReason = reason
    swapRequest.hasAlternatives = alternatives.length > 0
    releaseRequestHolds(swapRequest.id)
    // A reschedule is said as a move, not a cancellation, so the thread doesn't read as the end of it.
    publish(requestMessage, alternatives.length > 0 ? 'Session moved: new times proposed.' : 'Session cancelled.')
    // The reason goes into the thread as the member's own message, as the cancel dialog promises,
    // so the other member reads why at the time it happened rather than under the old request's date.
    const note: Message = { id: `msg-${crypto.randomUUID()}`, conversationId: requestMessage.conversationId, senderId: actorId, sentAt: now, kind: 'text', body: reason }
    mockMessages.push(note)
    emitChatEvent({ type: 'message', message: structuredClone(note) })
  }

  if (alternatives.length === 0) {
    refundIfPaid({ ...session, sessionId })
    return null
  }
  const offer = offerAlternatives(session, actorId, otherId, alternatives, reason, now)
  emitChatEvent({ type: 'message', message: structuredClone(offer) })
  return offer
}

export async function cancelSession(sessionId: string, reason: string, alternatives: string[]): Promise<void> {
  await mockRequest('session-action', null)
  runSessionChecks()
  const session = mockSessions.find((item) => item.id === sessionId)
  if (!session) throw new SessionClosedError()
  if (alternatives.length > 0 && !canOfferAlternatives(session, CURRENT_USER_ID)) throw new SessionClosedError()
  const partnerId = getPartnerId(session)
  const now = Date.now()
  // The session being cancelled still counts as busy, so an alternative can't be the same time.
  if (alternatives.some((start) => getCustomSlotError(start, now) !== null || getSlotStatus(partnerId, start, now) !== 'open')) {
    throw new SlotTakenError()
  }
  const offer = cancelSessionAs(sessionId, CURRENT_USER_ID, reason, alternatives)
  if (!offer) return
  // Stands in for the other member answering, so the new card can be seen updating live.
  setTimeout(() => {
    const { status, lastProposedBy } = offer.swapRequest
    if (status === 'pending' && lastProposedBy === CURRENT_USER_ID) confirmRequest(offer, alternatives[0])
  }, MOCK_PEER_ANSWER_MS)
}
