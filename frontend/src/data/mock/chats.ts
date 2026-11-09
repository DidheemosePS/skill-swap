import type { Conversation, Message, SwapRequest } from '../../types'
import { requestBea, requestCole, requestDina, requestEvan, requestFaye, requestGus, requestIvo } from './swapRequests'
import { fromNow } from './time'

// Sorted by recent activity, as the conversation list displays them.
export const mockConversations: Conversation[] = [
  { id: 'conv-evan', peerId: 'user-evan', unreadCount: 1, lastMessagePreview: 'Sent you a swap request.', lastMessageAt: fromNow({ minutes: -5 }) },
  { id: 'conv-bea', peerId: 'user-bea', unreadCount: 0, lastMessagePreview: 'Here is the function I am stuck on.', lastMessageAt: fromNow({ hours: -2 }) },
  { id: 'conv-cole', peerId: 'user-cole', unreadCount: 0, lastMessagePreview: 'You sent a swap request.', lastMessageAt: fromNow({ hours: -3 }) },
  { id: 'conv-faye', peerId: 'user-faye', unreadCount: 0, lastMessagePreview: 'Confirmed. Bring the settings screen.', lastMessageAt: fromNow({ days: -1 }) },
  { id: 'conv-ivo', peerId: 'user-ivo', unreadCount: 0, lastMessagePreview: 'Swap confirmed.', lastMessageAt: fromNow({ days: -2 }) },
  { id: 'conv-gus', peerId: 'user-gus', unreadCount: 1, lastMessagePreview: 'Swap request declined.', lastMessageAt: fromNow({ days: -3 }) },
  { id: 'conv-dina', peerId: 'user-dina', unreadCount: 0, lastMessagePreview: 'Swap request expired.', lastMessageAt: fromNow({ days: -4 }) },
]

const text = (id: string, conversationId: string, senderId: string, sentAt: string, body: string): Message => ({
  id,
  conversationId,
  senderId,
  sentAt,
  kind: 'text',
  body,
})

const request = (id: string, conversationId: string, sentAt: string, swapRequest: SwapRequest): Message => ({
  id,
  conversationId,
  senderId: swapRequest.requesterId,
  sentAt,
  kind: 'swap_request',
  swapRequest,
})

export const mockMessages: Message[] = [
  request('msg-evan-1', 'conv-evan', fromNow({ minutes: -6 }), requestEvan),
  request('msg-cole-1', 'conv-cole', fromNow({ hours: -3 }), requestCole),
  request('msg-bea-1', 'conv-bea', fromNow({ days: -1 }), requestBea),
  text('msg-bea-2', 'conv-bea', 'user-bea', fromNow({ hours: -2, minutes: -1 }), 'Here is the function I am stuck on.'),
  {
    id: 'msg-bea-3',
    conversationId: 'conv-bea',
    senderId: 'user-bea',
    sentAt: fromNow({ hours: -2 }),
    kind: 'code',
    language: 'python',
    code: 'def average(values):\n    return sum(values) / len(values)  # fails on an empty list',
  },
  request('msg-faye-1', 'conv-faye', fromNow({ days: -1, hours: -1 }), requestFaye),
  text('msg-faye-2', 'conv-faye', 'user-faye', fromNow({ days: -1 }), 'Confirmed. Bring the settings screen.'),
  request('msg-ivo-1', 'conv-ivo', fromNow({ days: -2 }), requestIvo),
  request('msg-gus-1', 'conv-gus', fromNow({ days: -3, hours: -2 }), requestGus),
  request('msg-dina-1', 'conv-dina', fromNow({ days: -4 }), requestDina),
]
