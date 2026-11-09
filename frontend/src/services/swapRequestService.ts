import {
  CURRENT_USER_ID,
  mockConversations,
  mockMessages,
  mockSessions,
  mockTransactions,
  mockWallet,
} from '../data/mockData'
import type { Conversation, CreateSwapRequestPayload, CreateSwapRequestResult, SwapRequest } from '../types'
import { getHoldExpiry } from '../utils/timeSlots'
import { mockRequest } from './mockClient'
import { getPeerSlots, holdRequestTimes } from './slotService'

// A request stays open while any of its times can still be accepted.
export const getRequestExpiry = (slots: string[], now: number) =>
  slots.map((slot) => getHoldExpiry(slot, now)).sort().at(-1) ?? null

// Someone else took a proposed time after the picker loaded. Maps to a 409 from the real API.
export class SlotTakenError extends Error {}

export function getOrCreateConversation(peerId: string, now: string): Conversation {
  const existing = mockConversations.find((item) => item.peerId === peerId)
  if (existing) return existing
  const conversation = { id: `conv-${crypto.randomUUID()}`, peerId, unreadCount: 0, lastMessagePreview: '', lastMessageAt: now }
  mockConversations.unshift(conversation)
  return conversation
}

// Writes to the mock arrays so the request is still there when other pages read them.
// The real backend does all of this in one transaction behind POST /swap-requests.
export async function createSwapRequest(payload: CreateSwapRequestPayload): Promise<CreateSwapRequestResult> {
  await mockRequest('swap-request', null)
  const isOneWay = payload.swapType === 'one_way'
  if (isOneWay && mockWallet.credits < 1) throw new Error('Not enough credits')
  // Checked again on send: the picker's data can be out of date by the time someone submits.
  const openSlots = getPeerSlots(payload.peerId, Date.now()).filter((slot) => slot.status === 'open')
  if (payload.proposedSlots.some((start) => !openSlots.some((slot) => slot.startsAt === start))) {
    throw new SlotTakenError()
  }

  const now = new Date().toISOString()
  const sessionId = `session-${crypto.randomUUID()}`
  const swapRequest: SwapRequest = {
    ...payload,
    id: `request-${crypto.randomUUID()}`,
    requesterId: CURRENT_USER_ID,
    recipientId: payload.peerId,
    teacherId: payload.peerId,
    learnerId: CURRENT_USER_ID,
    lastProposedBy: CURRENT_USER_ID,
    status: 'pending',
    counterNote: null,
    confirmedStartsAt: null,
    cancelledBy: null,
    cancelReason: null,
    hasAlternatives: false,
    expiresAt: getRequestExpiry(payload.proposedSlots, Date.now()),
    meetingUrl: null,
    sessionId,
  }

  const conversation = getOrCreateConversation(payload.peerId, now)
  conversation.lastMessagePreview = 'You sent a swap request.'
  conversation.lastMessageAt = now

  mockMessages.push({
    id: `msg-${crypto.randomUUID()}`,
    conversationId: conversation.id,
    senderId: CURRENT_USER_ID,
    sentAt: now,
    kind: 'swap_request',
    swapRequest,
  })
  mockSessions.push({
    id: sessionId,
    swapType: payload.swapType,
    teacherId: payload.peerId,
    learnerId: CURRENT_USER_ID,
    skillId: payload.skillId,
    returnSkillId: payload.returnSkillId,
    startsAt: payload.proposedSlots[0],
    durationMinutes: 60,
    status: 'pending',
    meetingUrl: null,
    attendance: [],
  })

  holdRequestTimes(swapRequest, Date.now())

  // Holding the credit now stops a member from promising the same credit to several mentors.
  if (isOneWay) {
    mockWallet.credits -= 1
    mockWallet.escrowCredits += 1
    mockTransactions.unshift({
      id: `tx-${crypto.randomUUID()}`,
      createdAt: now,
      type: 'session_booking',
      partnerId: payload.peerId,
      amount: -1,
      status: 'in_escrow',
      sessionId,
    })
  }
  return { conversationId: conversation.id, swapRequest }
}
