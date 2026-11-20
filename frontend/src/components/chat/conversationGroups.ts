import type { ConversationSummary } from '../../types'

export type ConversationGroup = 'needs' | 'booked' | 'waiting' | 'other'

const SESSION_MS = 60 * 60_000

// Who acts next: a request waiting on you first, then booked, then waiting on them. A session that is settling
// or under review waits on the clock or an admin, never on the member.
export function getConversationGroup({ latestRequest, settling, underReview }: ConversationSummary, now: number): ConversationGroup {
  // A live request or booking below says more; otherwise a settling or reviewed session means waiting.
  const fallback = settling || underReview ? 'waiting' : 'other'
  if (!latestRequest) return fallback
  if (latestRequest.status === 'pending') return latestRequest.awaitingMe ? 'needs' : 'waiting'
  if (latestRequest.status === 'confirmed' && latestRequest.confirmedStartsAt && Date.parse(latestRequest.confirmedStartsAt) + SESSION_MS > now) return 'booked'
  return fallback
}

// Search matches the person, the skills they teach or want, and the last message, so "spanish" finds Bea.
export function matchesSearch({ peer, lastMessagePreview }: ConversationSummary, query: string) {
  const key = query.trim().toLowerCase()
  if (!key) return true
  const skills = [...peer.teachSkills, ...peer.learnSkills].map(({ skill }) => skill.name)
  return [peer.name, lastMessagePreview, ...skills].some((text) => text.toLowerCase().includes(key))
}

// Why a row matched when the name and preview don't show it ("Learning Spanish"), so a skill hit isn't a mystery.
export function getMatchReason({ peer, lastMessagePreview }: ConversationSummary, query: string): string | null {
  const key = query.trim().toLowerCase()
  if (!key || [peer.name, lastMessagePreview].some((text) => text.toLowerCase().includes(key))) return null
  const teaches = peer.teachSkills.find(({ skill }) => skill.name.toLowerCase().includes(key))
  if (teaches) return `Teaches ${teaches.skill.name}`
  const learns = peer.learnSkills.find(({ skill }) => skill.name.toLowerCase().includes(key))
  return learns ? `Learning ${learns.skill.name}` : null
}

export const needsReply = (item: ConversationSummary, now: number) => getConversationGroup(item, now) === 'needs'

export type InboxFilter = 'all' | 'needs' | 'unread'

export function matchesFilter(item: ConversationSummary, filter: InboxFilter, now: number) {
  if (filter === 'needs') return needsReply(item, now)
  if (filter === 'unread') return item.unreadCount > 0
  return true
}
