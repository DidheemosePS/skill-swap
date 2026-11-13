import { CURRENT_USER_ID, mockConversations, mockMessages, mockSessions, mockUsers } from '../data/mockData'
import type { ConversationSummary, Message, MessageDraft, SwapRequest } from '../types'
import { getChatAccess } from '../utils/chat'
import { getSessionPhase } from '../utils/sessions'
import { emitChatEvent } from './chatSocket'
import { mockRequest } from './mockClient'
import { hasSessionHistoryWith } from './sessionService'
import { expireLapsedRequests } from './swapRequestActions'

const MOCK_REPLY_MS = 2500
const MOCK_REPLIES = ['Thanks, that works for me.', 'Good to know. See you then!', 'Let me take a look and get back to you.']

// The live pending request with this peer, if any. Read at call time, so a request sent
// this visit shows as pending after navigating back.
export function getPendingRequest(peerId: string): SwapRequest | null {
  const message = mockMessages.find(
    (item) =>
      item.kind === 'swap_request' &&
      item.swapRequest.status === 'pending' &&
      (item.swapRequest.expiresAt === null || Date.parse(item.swapRequest.expiresAt) > Date.now()) &&
      [item.swapRequest.requesterId, item.swapRequest.recipientId].includes(peerId),
  )
  return message?.kind === 'swap_request' ? message.swapRequest : null
}

// Who sent it. A credit is held only on requests the member sent.
export function getPendingRequestFrom(peerId: string): 'me' | 'them' | null {
  const request = getPendingRequest(peerId)
  if (!request) return null
  return request.requesterId === CURRENT_USER_ID ? 'me' : 'them'
}

export const hasPendingRequestWith = (peerId: string) => getPendingRequestFrom(peerId) !== null

export function fetchUnreadCount(): Promise<number> {
  const total = mockConversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)
  return mockRequest('unread', total, 0)
}

// The newest request in a conversation, summarised for the list row.
function getLatestRequest(conversationId: string): ConversationSummary['latestRequest'] {
  const latest = mockMessages
    .filter((message) => message.conversationId === conversationId && message.kind === 'swap_request')
    .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))[0]
  if (latest?.kind !== 'swap_request') return null
  const request = latest.swapRequest
  return {
    status: request.status,
    swapType: request.swapType,
    awaitingMe: request.lastProposedBy !== CURRENT_USER_ID,
    iAmLearner: request.learnerId === CURRENT_USER_ID,
    confirmedStartsAt: request.confirmedStartsAt,
    // Declined by the member answering, or withdrawn by the member who asked.
    closedByMe:
      (request.status === 'declined' && request.lastProposedBy !== CURRENT_USER_ID) ||
      (request.status === 'cancelled' && (request.cancelledBy === CURRENT_USER_ID || (request.cancelledBy === null && request.lastProposedBy === CURRENT_USER_ID))),
  }
}

// The same rule as the dashboard's settle rows: an ended session to mark, or a teacher's marking to confirm.
function getOwedSession(peerId: string): ConversationSummary['owedSession'] {
  const now = Date.now()
  for (const session of mockSessions) {
    if (![session.teacherId, session.learnerId].includes(peerId) || ![session.teacherId, session.learnerId].includes(CURRENT_USER_ID)) continue
    const phase = getSessionPhase(session, now)
    const owed = { id: session.id, startsAt: session.startsAt, skillId: session.skillId, iTaught: session.teacherId === CURRENT_USER_ID }
    if (phase === 'awaiting_settlement') return { ...owed, mode: 'resolve' }
    if (phase === 'pending_learner_review' && session.learnerId === CURRENT_USER_ID) return { ...owed, mode: 'confirm' }
  }
  return null
}

// A session with this peer waiting on an admin check, or on the learner confirming what the member taught.
function getSettlingSession(peerId: string): ConversationSummary['settlingSession'] {
  const shared = mockSessions.filter((session) => [session.teacherId, session.learnerId].includes(peerId) && [session.teacherId, session.learnerId].includes(CURRENT_USER_ID))
  if (shared.some((session) => session.status === 'disputed')) return 'under_review'
  if (shared.some((session) => session.status === 'pending_learner_review' && session.teacherId === CURRENT_USER_ID)) return 'awaiting_confirm'
  return null
}

export function fetchConversations(): Promise<ConversationSummary[]> {
  expireLapsedRequests()
  const summaries = mockConversations
    .flatMap((conversation) => {
      const peer = mockUsers.find((user) => user.id === conversation.peerId)
      return peer ? [{ ...conversation, peer, hasSessionHistory: hasSessionHistoryWith(peer.id), latestRequest: getLatestRequest(conversation.id), owedSession: getOwedSession(peer.id), settlingSession: getSettlingSession(peer.id) }] : []
    })
    .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt))
  return mockRequest('conversations', summaries, [])
}

export function fetchMessages(conversationId: string): Promise<Message[]> {
  expireLapsedRequests()
  const messages = mockMessages
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt))
  return mockRequest('messages', structuredClone(messages), [])
}

function addMessage(message: Message, preview: string, isUnread: boolean) {
  mockMessages.push(message)
  const conversation = mockConversations.find((item) => item.id === message.conversationId)
  if (!conversation) return
  conversation.lastMessagePreview = preview
  conversation.lastMessageAt = message.sentAt
  if (isUnread) conversation.unreadCount += 1
}

// Stands in for the other member typing back, so incoming messages can be seen arriving.
function scheduleMockReply(conversationId: string, peerId: string) {
  setTimeout(() => {
    const body = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
    const reply: Message = {
      id: `msg-${crypto.randomUUID()}`,
      conversationId,
      senderId: peerId,
      sentAt: new Date().toISOString(),
      kind: 'text',
      body,
    }
    addMessage(reply, body, true)
    emitChatEvent({ type: 'message', message: reply })
  }, MOCK_REPLY_MS)
}

// Maps to a 403 from the real API. The UI hides the message box, but the server has to enforce this.
export class ChatLockedError extends Error {}

export async function sendMessage(conversationId: string, peerId: string, draft: MessageDraft): Promise<Message> {
  await mockRequest('send-message', null)
  const thread = mockMessages.filter((item) => item.conversationId === conversationId)
  if (getChatAccess(thread, CURRENT_USER_ID, hasSessionHistoryWith(peerId)) !== 'open') throw new ChatLockedError()
  const message: Message = {
    ...draft,
    id: `msg-${crypto.randomUUID()}`,
    conversationId,
    senderId: CURRENT_USER_ID,
    sentAt: new Date().toISOString(),
  }
  addMessage(message, draft.body, false)
  scheduleMockReply(conversationId, peerId)
  emitChatEvent({ type: 'message', message })
  return message
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await mockRequest('read', null)
  const conversation = mockConversations.find((item) => item.id === conversationId)
  if (!conversation || conversation.unreadCount === 0) return
  conversation.unreadCount = 0
  emitChatEvent({ type: 'read', conversationId })
}
