import type { SessionToSettle } from '../../hooks/useDashboard'
import type { MatchRecommendation, SessionDetail } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'

// What a row needs to say, as data: the panel decides how to lay it out and which action to render.
export type InboxAction =
  | { kind: 'settle'; item: SessionToSettle; label: 'Did it happen?' | 'Confirm' }
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
  if (direction === 'outgoing') return `You asked to ${creditCost === 0 ? 'swap' : 'learn'} ${skill} · ${first(peer.name)}'s turn to reply`
  if (pendingRequest?.awaitingMe === false) return `You sent new times · ${first(peer.name)}'s turn to reply`
  return creditCost === 0 ? `Wants to swap ${skill} with you` : `Wants to learn ${skill} from you`
}

// Owed first: outcomes to answer or confirm (each holds a credit until settled), then replies owed.
export function needsYouItems(toSettle: SessionToSettle[], incoming: MatchRecommendation[]): InboxItem[] {
  return [
    ...toSettle.map((item): InboxItem => {
      const { session, mode } = item
      return {
        key: session.id,
        name: session.partner.name,
        peerId: session.partner.id,
        avatarUrl: session.partner.avatarUrl,
        line: mode === 'confirm'
          ? `Marked your ${session.skillName} session complete`
          : `Your ${session.skillName} session ended ${formatSlotDateTime(session.startsAt)}`,
        action: { kind: 'settle', item, label: mode === 'confirm' ? 'Confirm' : 'Did it happen?' },
      }
    }),
    ...incoming.map((match): InboxItem => ({
      key: match.id,
      name: match.peer.name,
      peerId: match.peer.id,
      avatarUrl: match.peer.avatarUrl,
      line: requestLine(match, 'incoming'),
      action: { kind: 'request', match, label: 'Reply' },
    })),
  ]
}

// Settled on the member's side but closed by someone else (an admin, or the learner), then requests sent.
export function waitingItems(waitingSessions: SessionDetail[], outgoing: MatchRecommendation[]): InboxItem[] {
  return [
    ...waitingSessions.map((session): InboxItem => ({
      key: session.id,
      name: session.partner.name,
      peerId: session.partner.id,
      avatarUrl: session.partner.avatarUrl,
      line: session.status === 'disputed' ? `Your ${session.skillName} session is under review` : `You marked ${session.skillName} complete · ${first(session.partner.name)}'s turn to confirm`,
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
