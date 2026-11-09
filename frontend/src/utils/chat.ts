import type { ChatAccess, Message } from '../types'
import { formatSlotDateTime, formatSlotTime } from './timeSlots'

// Today's messages only need the time; older ones also need the date.
export function formatMessageTime(iso: string, now: number): string {
  return new Date(iso).toDateString() === new Date(now).toDateString() ? formatSlotTime(iso) : formatSlotDateTime(iso)
}

export const MAX_MESSAGE_LENGTH = 4000
export const MAX_NOTE_LENGTH = 200

// Chat needs a live or completed session between the two members. A confirmed card also counts,
// so the box opens the moment a request is accepted, before anything is refetched. Without either,
// messages wait on the latest request, and the request card handles the negotiation.
export function getChatAccess(messages: Message[], currentUserId: string, hasSessionHistory: boolean): ChatAccess {
  const requests = messages.flatMap((message) => (message.kind === 'swap_request' ? [message.swapRequest] : []))
  if (hasSessionHistory || requests.some((request) => request.status === 'confirmed')) return 'open'
  const latest = requests.at(-1)
  if (!latest) return 'no_request'
  // Only a confirmed request has a start time, so this means a booked session was called off.
  if (latest.status === 'cancelled' && latest.confirmedStartsAt) return 'session_cancelled'
  if (latest.status !== 'pending') return 'closed'
  return latest.lastProposedBy === currentUserId ? 'waiting_on_peer' : 'waiting_on_you'
}
