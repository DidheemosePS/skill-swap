import type { MatchRecommendation, SessionDetail } from '../../types'

// What a row needs to say, as data: the panel decides how to lay it out and which action to render.
export type InboxAction =
  | { kind: 'request'; match: MatchRecommendation; label: 'Reply' | 'View request' }
  | { kind: 'link'; to: string; label: 'Details' }

export interface InboxItem {
  key: string
  name: string
  peerId: string
  avatarUrl: string | null
  // One plain sentence about where it stands ("Your Python session ended Thu 12 Nov, 21:00"). Credits aren't
  // tagged on each row; the tour explains them once, and the Wallet shows the totals.
  line: string
  action: InboxAction
}

const first = (name: string) => name.split(' ')[0]

// Names the skill and who teaches it, since "Python request" didn't say who wants what.
function requestLine({ pendingRequest, creditCost, peer }: MatchRecommendation, direction: 'incoming' | 'outgoing') {
  const skill = pendingRequest?.skillName ?? 'a session'
  if (direction === 'outgoing') return `You asked to ${creditCost === 0 ? 'swap' : 'learn'} ${skill}. ${first(peer.name)}'s turn to reply`
  if (pendingRequest?.awaitingMe === false) return `You sent new times. ${first(peer.name)}'s turn to reply`
  return creditCost === 0 ? `Wants to swap ${skill} with you` : `Wants to learn ${skill} from you`
}

// Replies owed. Settling sessions aren't here: they settle on their own and get their own quiet card.
export function needsYouItems(incoming: MatchRecommendation[]): InboxItem[] {
  return incoming.map((match): InboxItem => ({
    key: match.id,
    name: match.peer.name,
    peerId: match.peer.id,
    avatarUrl: match.peer.avatarUrl,
    line: requestLine(match, 'incoming'),
    action: { kind: 'request', match, label: 'Reply' },
  }))
}

// A concern an admin is deciding, then requests sent.
export function waitingItems(waitingSessions: SessionDetail[], outgoing: MatchRecommendation[]): InboxItem[] {
  return [
    ...waitingSessions.map((session): InboxItem => ({
      key: session.id,
      name: session.partner.name,
      peerId: session.partner.id,
      avatarUrl: session.partner.avatarUrl,
      line: `Your ${session.skillName} session is with an admin`,
      action: { kind: 'link', to: '/sessions', label: 'Details' },
    })),
    ...outgoing.map((match): InboxItem => ({
      key: match.id,
      name: match.peer.name,
      peerId: match.peer.id,
      avatarUrl: match.peer.avatarUrl,
      line: requestLine(match, 'outgoing'),
      action: { kind: 'request', match, label: 'View request' },
    })),
  ]
}
