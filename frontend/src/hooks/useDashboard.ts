import { fetchMatches } from '../services/matchService'
import { fetchMySessions } from '../services/sessionService'
import { isInProgress } from '../utils/matches'
import { getImminentSession, getSessionPhase } from '../utils/sessions'
import { useAsyncData } from './useAsyncData'
import { useNow } from './useNow'

// The one thing that needs the member. The header phrases it, so it can be worded around an imminent session.
export type NeedsYou =
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
  // Ended sessions in their 24-hour window. They settle on their own, so they never count as needing the member.
  const settling = all.filter((session) => getSessionPhase(session, now) === 'awaiting_settlement')
  // A concern with an admin. Listed so it doesn't just vanish from the page.
  const waitingSessions = all.filter((session) => getSessionPhase(session, now) === 'disputed')
  const imminent = getImminentSession(upcoming, now)

  const allMatches = matches.data ?? []
  // Anyone with a live row on the board (settling, booked, under review) is reached from that row,
  // so they aren't offered again as a match. Past partners return to the feed: rebooking them is the easiest booking.
  // Pending requests are already left out by isInProgress.
  const activePeers = new Set([...settling, ...upcoming, ...waitingSessions].map((session) => session.partner.id))
  const feedMatches = allMatches.filter((match) => !activePeers.has(match.peerId))
  const incoming = allMatches.filter((match) => match.pendingRequestFrom === 'them')
  const outgoing = allMatches.filter((match) => match.pendingRequestFrom === 'me')
  const isReady = sessions.status === 'ready' && matches.status === 'ready'
  const isNewMember = isReady && all.length === 0 && incoming.length === 0 && outgoing.length === 0

  let needsYou: NeedsYou | null = null
  if (incoming.length === 1) needsYou = { kind: 'reply', name: firstName(incoming[0].peer.name) }
  else if (incoming.length > 1) needsYou = { kind: 'replies', count: incoming.length }

  return {
    matches,
    sessions,
    upcoming,
    settling,
    now,
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
