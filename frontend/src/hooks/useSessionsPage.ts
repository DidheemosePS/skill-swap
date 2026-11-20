import { fetchMySessions, fetchRequestedSessions } from '../services/sessionService'
import type { RequestedSession, SessionDetail } from '../types'
import { getImminentSession, getSessionPhase } from '../utils/sessions'
import { useAsyncData } from './useAsyncData'
import { useNow } from './useNow'

// One agenda line: a booked session, or a request shown at its first proposed time.
export type AgendaItem =
  | { kind: 'booked'; at: string; session: SessionDetail }
  | { kind: 'requested'; at: string; request: RequestedSession }

const HISTORY = new Set(['completed', 'cancelled', 'no_show_confirmed', 'mutual_no_show'])

// Sorts every session into the page's order: the one to join, what's settling, what an admin is reviewing,
// what's coming, and the settled history. Kept out of the page so the page stays layout.
export function useSessionsPage() {
  const sessions = useAsyncData(fetchMySessions)
  const requests = useAsyncData(fetchRequestedSessions)
  // A slow tick moves a session into the hour or past its end; the plum note runs its own countdown.
  const now = useNow(30_000)

  const all = sessions.data ?? []
  const phaseOf = (session: SessionDetail) => getSessionPhase(session, now)
  const byStart = (a: { startsAt: string }, b: { startsAt: string }) => Date.parse(a.startsAt) - Date.parse(b.startsAt)
  const upcoming = all.filter((session) => phaseOf(session) === 'confirmed').sort(byStart)

  // Ended and in the 24-hour window: each settles on its own from the attendance records.
  const settling = all.filter((session) => phaseOf(session) === 'awaiting_settlement').sort(byStart)
  // A concern with an admin. Listed so it doesn't vanish between Settling and Past.
  const checking = all.filter((session) => phaseOf(session) === 'disputed')
  const history = all.filter((session) => HISTORY.has(phaseOf(session))).sort((a, b) => byStart(b, a))

  const agenda: AgendaItem[] = [
    ...upcoming.map((session): AgendaItem => ({ kind: 'booked', at: session.startsAt, session })),
    ...(requests.data ?? []).map((request): AgendaItem => ({ kind: 'requested', at: request.proposedSlots[0], request })),
  ].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))

  return {
    now,
    // Requests only add lines to the agenda, so the page can show sessions without them if they fail.
    status: sessions.status,
    hasLoaded: sessions.data !== null,
    // Requests add agenda lines, so "nothing here" waits for them too.
    requestsSettled: requests.status !== 'loading',
    imminent: getImminentSession(upcoming, now),
    settling,
    agenda,
    checking,
    history,
    requestsFailed: requests.status === 'error',
    retry: () => {
      sessions.retry()
      requests.retry()
    },
  }
}
