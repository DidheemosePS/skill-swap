import { CURRENT_USER_ID, mockConversations, mockMessages, mockUsers } from '../data/mockData'
import type { ConversationSummary, Message, MessageDraft } from '../types'
import { getChatAccess } from '../utils/chat'
import { emitChatEvent } from './chatSocket'
import { mockRequest } from './mockClient'
import { hasSessionHistoryWith } from './sessionService'
import { expireLapsedRequests } from './swapRequestActions'

const MOCK_REPLY_MS = 2500
const MOCK_REPLIES = ['Thanks, that works for me.', 'Good to know. See you then!', 'Let me take a look and get back to you.']

// Read at call time, so a request sent this visit shows as pending after navigating back.
export const hasPendingRequestWith = (peerId: string) =>
  mockMessages.some(
    (message) =>
      message.kind === 'swap_request' &&
      message.swapRequest.status === 'pending' &&
      (message.swapRequest.expiresAt === null || Date.parse(message.swapRequest.expiresAt) > Date.now()) &&
      [message.swapRequest.requesterId, message.swapRequest.recipientId].includes(peerId),
  )

export function fetchUnreadCount(): Promise<number> {
  const total = mockConversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0)
  return mockRequest('unread', total, 0)
}

export function fetchConversations(): Promise<ConversationSummary[]> {
  expireLapsedRequests()
  const summaries = mockConversations
    .flatMap((conversation) => {
      const peer = mockUsers.find((user) => user.id === conversation.peerId)
      return peer ? [{ ...conversation, peer, hasSessionHistory: hasSessionHistoryWith(peer.id) }] : []
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
  addMessage(message, draft.kind === 'text' ? draft.body : 'Shared a code snippet.', false)
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
