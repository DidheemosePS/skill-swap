import type { Conversation, Message, SwapRequest } from '../../types'
import { requestBea, requestCole, requestDina, requestDinaSettle, requestEvan, requestFaye, requestGus, requestIvo } from './swapRequests'
import { fromNow } from './time'

// Sorted by recent activity, as the conversation list displays them.
export const mockConversations: Conversation[] = [
  { id: 'conv-evan', peerId: 'user-evan', unreadCount: 1, lastMessagePreview: 'Sent you a session request.', lastMessageAt: fromNow({ minutes: -5 }) },
  { id: 'conv-bea', peerId: 'user-bea', unreadCount: 0, lastMessagePreview: 'It is the one about averages. It breaks when the list is empty.', lastMessageAt: fromNow({ hours: -2 }) },
  { id: 'conv-cole', peerId: 'user-cole', unreadCount: 0, lastMessagePreview: 'You sent a swap request.', lastMessageAt: fromNow({ hours: -3 }) },
  { id: 'conv-faye', peerId: 'user-faye', unreadCount: 1, lastMessagePreview: 'Could you send it over the day before?', lastMessageAt: fromNow({ minutes: -40 }) },
  { id: 'conv-ivo', peerId: 'user-ivo', unreadCount: 0, lastMessagePreview: 'Session confirmed.', lastMessageAt: fromNow({ days: -2 }) },
  { id: 'conv-gus', peerId: 'user-gus', unreadCount: 0, lastMessagePreview: 'Session request declined.', lastMessageAt: fromNow({ days: -9 }) },
  { id: 'conv-dina', peerId: 'user-dina', unreadCount: 0, lastMessagePreview: 'See you there!', lastMessageAt: fromNow({ hours: -3 }) },
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
  text('msg-bea-2', 'conv-bea', 'user-bea', fromNow({ hours: -2, minutes: -1 }), 'I will bring the exercise I am stuck on.'),
  text('msg-bea-3', 'conv-bea', 'user-bea', fromNow({ hours: -2 }), 'It is the one about averages. It breaks when the list is empty.'),
  request('msg-faye-1', 'conv-faye', fromNow({ days: -1, hours: -1 }), requestFaye),
  text('msg-faye-2', 'conv-faye', 'user-faye', fromNow({ days: -1 }), 'Confirmed. Bring the settings screen.'),
  // Unread, so opening Faye's thread shows the New messages divider.
  text('msg-faye-3', 'conv-faye', 'user-faye', fromNow({ minutes: -40 }), 'Could you send it over the day before?'),
  request('msg-ivo-1', 'conv-ivo', fromNow({ days: -2 }), requestIvo),
  request('msg-gus-1', 'conv-gus', fromNow({ days: -10 }), requestGus),
  request('msg-dina-1', 'conv-dina', fromNow({ days: -12 }), requestDina),
  request('msg-dina-2', 'conv-dina', fromNow({ days: -2 }), requestDinaSettle),
  text('msg-dina-3', 'conv-dina', 'user-dina', fromNow({ hours: -3 }), 'See you there!'),
]
