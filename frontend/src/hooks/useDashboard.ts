import { fetchMatches } from '../services/matchService'
import { fetchMySessions } from '../services/sessionService'
import type { SessionDetail } from '../types'
import { isInProgress } from '../utils/matches'
import { getImminentSession, getSessionPhase } from '../utils/sessions'
import { useAsyncData } from './useAsyncData'
import { useNow } from './useNow'

export type SettleMode = 'resolve' | 'confirm'

// What a settle row needs: the session and which step the member owes it.
export interface SessionToSettle {
  session: SessionDetail
  mode: SettleMode
}

// The one thing that needs the member. The header phrases it, so it can be worded around an imminent session.
export type NeedsYou =
  | { kind: 'settle'; name: string; mode: SettleMode }
  | { kind: 'reply'; name: string }
  | { kind: 'replies'; count: number }

const firstName = (name: string) => name.split(' ')[0]

// Everything the dashboard derives from sessions and matches, kept out of the page so it stays layout.
export function useDashboard() {
  const matches = useAsyncData(fetchMatches)
  const sessions = useAsyncData(fetchMySessions)
  // A slow tick is enough to notice a session entering the hour; the strip runs its own countdown.
  const now = useNow(30_000)

  const all = sessions.data ?? []
  const upcoming = all
    .filter((session) => getSessionPhase(session, now) === 'confirmed')
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  // Past sessions still holding a credit until the member acts: an outcome to mark, or a teacher's
  // completion to confirm as the learner. These are the only items on the page that need them.
  const toSettle: SessionToSettle[] = all.flatMap((session): SessionToSettle[] => {
    const phase = getSessionPhase(session, now)
    if (phase === 'awaiting_settlement') return [{ session, mode: 'resolve' }]
    if (phase === 'pending_learner_review' && !session.isTeaching) return [{ session, mode: 'confirm' }]
    return []
  })
  // Settled by the member but not closed yet: a report or dispute under review, or a taught session
  // the learner still has to confirm. Listed so a report doesn't just vanish from the page.
  const waitingSessions = all.filter((session) => {
    const phase = getSessionPhase(session, now)
    return phase === 'disputed' || (phase === 'pending_learner_review' && session.isTeaching)
  })
  const imminent = getImminentSession(upcoming, now)

  const allMatches = matches.data ?? []
  // Anyone with a live row in the inbox (to settle, booked, under review) is reached from that row,
  // so they aren't offered again as a match. Past partners return to the feed: rebooking them is the easiest booking.
  // Pending requests are already left out by isInProgress.
  const activePeers = new Set([...toSettle.map(({ session }) => session), ...upcoming, ...waitingSessions].map((session) => session.partner.id))
  const feedMatches = allMatches.filter((match) => !activePeers.has(match.peerId))
  const incoming = allMatches.filter((match) => match.pendingRequestFrom === 'them')
  const outgoing = allMatches.filter((match) => match.pendingRequestFrom === 'me')
  const isReady = sessions.status === 'ready' && matches.status === 'ready'
  const isNewMember = isReady && all.length === 0 && incoming.length === 0 && outgoing.length === 0

  // A session to settle comes first, then a reply owed.
  let needsYou: NeedsYou | null = null
  if (toSettle.length > 0) needsYou = { kind: 'settle', name: firstName(toSettle[0].session.partner.name), mode: toSettle[0].mode }
  else if (incoming.length === 1) needsYou = { kind: 'reply', name: firstName(incoming[0].peer.name) }
  else if (incoming.length > 1) needsYou = { kind: 'replies', count: incoming.length }

  return {
    matches,
    sessions,
    upcoming,
    toSettle,
    waitingSessions,
    imminent,
    incoming,
    outgoing,
    allMatches,
    feedMatches,
    isNewMember,
    nextStep: isReady
      ? {
          imminentWith: imminent ? firstName(imminent.partner.name) : null,
          needsYou,
          waitingCount: outgoing.length,
          newCount: feedMatches.filter((match) => !isInProgress(match)).length,
        }
      : null,
  }
}
