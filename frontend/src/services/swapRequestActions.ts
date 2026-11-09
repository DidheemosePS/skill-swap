import { CURRENT_USER_ID, mockConversations, mockMessages, mockSessions, mockSlotHolds, mockTransactions, mockWallet } from '../data/mockData'
import type { Message, SwapRequest, SwapRequestMessage } from '../types'
import { getCustomSlotError, getHoldExpiry } from '../utils/timeSlots'
import { emitChatEvent } from './chatSocket'
import { mockRequest } from './mockClient'
import { getMyConfirmedSessionTimes, getSlotStatus, holdRequestTimes, releaseRequestHolds } from './slotService'
import { getRequestExpiry, SlotTakenError } from './swapRequestService'

const MOCK_PEER_ANSWER_MS = 4000

// The request was already answered or lapsed. Maps to a 409 from the real API.
export class RequestClosedError extends Error {}

export const isRequestMessage = (message: Message): message is SwapRequestMessage => message.kind === 'swap_request'

const getOtherMember = ({ requesterId, recipientId }: SwapRequest) =>
  requesterId === CURRENT_USER_ID ? recipientId : requesterId

export function publish(message: SwapRequestMessage, preview: string): Message {
  const conversation = mockConversations.find((item) => item.id === message.conversationId)
  if (conversation) {
    conversation.lastMessagePreview = preview
    conversation.lastMessageAt = new Date().toISOString()
  }
  // A copy, so React sees a new object each time the same mock request changes.
  const snapshot = structuredClone(message)
  emitChatEvent({ type: 'message', message: snapshot })
  return snapshot
}

// Only the member who paid gets money back; the mock only tracks the current user's wallet.
export function refundIfPaid({ swapType, learnerId, sessionId }: Pick<SwapRequest, 'swapType' | 'learnerId' | 'sessionId'>) {
  if (swapType !== 'one_way' || learnerId !== CURRENT_USER_ID) return
  const booking = mockTransactions.find(
    (item) => item.sessionId === sessionId && item.type === 'session_booking' && item.status === 'in_escrow',
  )
  if (!booking) return
  booking.status = 'settled'
  mockWallet.credits += 1
  mockWallet.escrowCredits -= 1
  mockTransactions.unshift({
    id: `tx-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    type: 'escrow_refund',
    partnerId: booking.partnerId,
    amount: 1,
    status: 'settled',
    sessionId,
  })
}

// The shared ending for decline, cancel and expiry: every time opens up and any credit returns.
export function closeRequest(message: SwapRequestMessage, status: 'declined' | 'cancelled' | 'expired', preview: string): Message {
  const { swapRequest } = message
  swapRequest.status = status
  swapRequest.expiresAt = null
  releaseRequestHolds(swapRequest.id)
  const session = mockSessions.find((item) => item.id === swapRequest.sessionId)
  if (session) session.status = 'cancelled'
  refundIfPaid(swapRequest)
  return publish(message, preview)
}

export function confirmRequest(message: SwapRequestMessage, startsAt: string): Message {
  const { swapRequest } = message
  const meetingUrl = `https://example.com/meet/${swapRequest.sessionId}`
  swapRequest.status = 'confirmed'
  swapRequest.confirmedStartsAt = startsAt
  swapRequest.expiresAt = null
  swapRequest.meetingUrl = meetingUrl
  // Keep only the accepted time, now booked for good. Every other proposed time opens up.
  releaseRequestHolds(swapRequest.id, startsAt)
  const hold = mockSlotHolds.find((item) => item.requestId === swapRequest.id && item.startsAt === startsAt)
  if (hold) {
    hold.status = 'booked'
    hold.expiresAt = null
  }
  const session = mockSessions.find((item) => item.id === swapRequest.sessionId)
  if (session) Object.assign(session, { status: 'confirmed', startsAt, meetingUrl })
  return publish(message, 'Swap confirmed.')
}

export function expireLapsedRequests(now = Date.now()) {
  for (const message of mockMessages.filter(isRequestMessage)) {
    const { status, expiresAt } = message.swapRequest
    if (status === 'pending' && expiresAt && Date.parse(expiresAt) <= now) {
      closeRequest(message, 'expired', 'Swap request expired.')
    }
  }
}

// Shared guard: runs expiry first, so an action on a lapsed request fails rather than reviving it.
function getOpenRequest(requestId: string, canAct: (request: SwapRequest) => boolean): SwapRequestMessage {
  expireLapsedRequests()
  const message = mockMessages.filter(isRequestMessage).find((item) => item.swapRequest.id === requestId)
  if (!message || message.swapRequest.status !== 'pending' || !canAct(message.swapRequest)) {
    throw new RequestClosedError()
  }
  return message
}

const isMyTurn = ({ lastProposedBy }: SwapRequest) => lastProposedBy !== CURRENT_USER_ID

// A time can't be accepted within an hour of starting, matching the hold rule.
export const isSlotAcceptable = (startsAt: string, now: number) => getHoldExpiry(startsAt, now) > new Date(now).toISOString()

export async function acceptSwapRequest(requestId: string, startsAt: string): Promise<Message> {
  await mockRequest('swap-action', null)
  const message = getOpenRequest(requestId, isMyTurn)
  const now = Date.now()
  const start = Date.parse(startsAt)
  const clashes = getMyConfirmedSessionTimes(now).some(
    (busy) => start < Date.parse(busy.endsAt) && start + 3_600_000 > Date.parse(busy.startsAt),
  )
  if (!message.swapRequest.proposedSlots.includes(startsAt) || !isSlotAcceptable(startsAt, now) || clashes) {
    throw new SlotTakenError()
  }
  return confirmRequest(message, startsAt)
}

export async function counterSwapRequest(requestId: string, proposedSlots: string[], counterNote: string | null): Promise<Message> {
  await mockRequest('swap-action', null)
  const message = getOpenRequest(requestId, isMyTurn)
  const { swapRequest } = message
  const now = Date.now()
  const peerId = getOtherMember(swapRequest)
  // Checked one by one rather than against weekly hours, because a counter can suggest any time.
  const isUnavailable = (start: string) =>
    getCustomSlotError(start, now) !== null || getSlotStatus(peerId, start, now, requestId) !== 'open'
  if (proposedSlots.some(isUnavailable)) throw new SlotTakenError()

  releaseRequestHolds(requestId)
  swapRequest.proposedSlots = proposedSlots
  swapRequest.counterNote = counterNote
  swapRequest.lastProposedBy = CURRENT_USER_ID
  swapRequest.expiresAt = getRequestExpiry(proposedSlots, now)
  holdRequestTimes(swapRequest, now)
  const session = mockSessions.find((item) => item.id === swapRequest.sessionId)
  if (session) session.startsAt = proposedSlots[0]

  // Stands in for the other member answering, so a card can be seen updating live.
  setTimeout(() => {
    if (swapRequest.status === 'pending' && swapRequest.lastProposedBy === CURRENT_USER_ID) {
      confirmRequest(message, proposedSlots[0])
    }
  }, MOCK_PEER_ANSWER_MS)
  return publish(message, 'You suggested new times.')
}

export async function declineSwapRequest(requestId: string): Promise<Message> {
  await mockRequest('swap-action', null)
  return closeRequest(getOpenRequest(requestId, isMyTurn), 'declined', 'Swap request declined.')
}

export async function cancelSwapRequest(requestId: string): Promise<Message> {
  await mockRequest('swap-action', null)
  const message = getOpenRequest(requestId, (request) => !isMyTurn(request))
  return closeRequest(message, 'cancelled', 'Swap request cancelled.')
}
