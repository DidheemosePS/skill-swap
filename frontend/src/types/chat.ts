import type { SwapType } from './match'
import type { User } from './user'

export type SwapRequestStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'expired'

export interface SwapRequest {
  id: string
  swapType: SwapType
  requesterId: string
  recipientId: string
  teacherId: string
  learnerId: string
  skillId: string
  // The skill taught back in a two-way swap; null for one-way.
  returnSkillId: string | null
  // Optional context for the mentor, who can't chat with the learner until they accept.
  note: string | null
  // Written by whoever made the latest counter, explaining the new times.
  counterNote: string | null
  proposedSlots: string[]
  // A counter replaces proposedSlots, so this shows whose turn it is to respond.
  lastProposedBy: string
  status: SwapRequestStatus
  confirmedStartsAt: string | null
  // Set when a confirmed session is called off.
  cancelledBy: string | null
  cancelReason: string | null
  // True when the cancelling member offered new times, which keeps a one-way credit in escrow.
  hasAlternatives: boolean
  // When an unanswered request closes by itself. Null once it's been answered.
  expiresAt: string | null
  meetingUrl: string | null
  // Null when no session exists, such as a declined request.
  sessionId: string | null
}

interface BaseMessage {
  id: string
  conversationId: string
  senderId: string
  sentAt: string
}

export interface TextMessage extends BaseMessage {
  kind: 'text'
  body: string
}

export interface CodeMessage extends BaseMessage {
  kind: 'code'
  language: string
  code: string
}

export interface SwapRequestMessage extends BaseMessage {
  kind: 'swap_request'
  swapRequest: SwapRequest
}

// A union on `kind` lets the chat stream pick the right bubble with type-safe narrowing.
export type Message = TextMessage | CodeMessage | SwapRequestMessage

export interface Conversation {
  id: string
  peerId: string
  unreadCount: number
  lastMessagePreview: string
  lastMessageAt: string
}

export interface CreateSwapRequestPayload {
  peerId: string
  swapType: SwapType
  skillId: string
  returnSkillId: string | null
  note: string | null
  proposedSlots: string[]
}

export interface CreateSwapRequestResult {
  conversationId: string
  swapRequest: SwapRequest
}

export interface ConversationSummary extends Conversation {
  peer: User
  // True when the two members have a live or completed session, which keeps chat open.
  hasSessionHistory: boolean
}

export type MessageDraft =
  | { kind: 'text'; body: string }
  | { kind: 'code'; language: string; code: string }

// What the WebSocket delivers. A message event also covers updates, such as a request being accepted.
export type ChatEvent = { type: 'message'; message: Message } | { type: 'read'; conversationId: string }

// Why a member can or can't send messages in a conversation right now.
export type ChatAccess = 'open' | 'waiting_on_peer' | 'waiting_on_you' | 'closed' | 'session_cancelled' | 'no_request'
