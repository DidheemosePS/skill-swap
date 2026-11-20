import type { Session, SessionOutcome, SessionStatus } from '../types'

const MINUTE_MS = 60_000
export const JOIN_WINDOW_MINUTES = 10

export type JoinState = 'too_early' | 'open' | 'ended'

export const getSessionEndMs = ({ startsAt, durationMinutes }: Pick<Session, 'startsAt' | 'durationMinutes'>) =>
  Date.parse(startsAt) + durationMinutes * MINUTE_MS

export function getJoinState(session: Pick<Session, 'startsAt' | 'durationMinutes'>, now: number): JoinState {
  if (now >= getSessionEndMs(session)) return 'ended'
  return now >= Date.parse(session.startsAt) - JOIN_WINDOW_MINUTES * MINUTE_MS ? 'open' : 'too_early'
}

export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

const HOUR_MS = 3_600_000
// Credit moves this long after the scheduled end, unless a concern is raised or both members confirm first.
export const SETTLE_WINDOW_HOURS = 24
// Cancelling is free until this long before the start; sessions also can't be booked closer than this.
export const CANCEL_CUTOFF_HOURS = 2
export const CANCEL_CUTOFF_MS = CANCEL_CUTOFF_HOURS * HOUR_MS

export const getSettlesAtMs = (session: Pick<Session, 'startsAt' | 'durationMinutes'>) => getSessionEndMs(session) + SETTLE_WINDOW_HOURS * HOUR_MS

// Joining late still counts: anyone the provider recorded in the call before the scheduled end was present.
const wasPresent = (session: Pick<Session, 'attendance' | 'startsAt' | 'durationMinutes'>, userId: string) =>
  session.attendance.some((record) => record.userId === userId && Date.parse(record.joinedAt) < getSessionEndMs(session))

// The outcome the attendance records show. Members never report each other; this is the whole rule.
export function getExpectedOutcome(session: Pick<Session, 'attendance' | 'startsAt' | 'durationMinutes' | 'teacherId' | 'learnerId'>): SessionOutcome {
  const teacher = wasPresent(session, session.teacherId)
  const learner = wasPresent(session, session.learnerId)
  if (teacher && learner) return 'completed'
  if (learner) return 'no_show_teacher'
  if (teacher) return 'no_show_learner'
  return 'mutual_no_show'
}

// After the cutoff a cancel is late: it moves the credit and counts as an absence for the canceller.
export const isLateCancel = (startsAt: string, now: number) => Date.parse(startsAt) - now < CANCEL_CUTOFF_MS

// A confirmed session that has ended needs an outcome, even if the server hasn't said so yet.
export function getSessionPhase({ status, startsAt, durationMinutes }: Pick<Session, 'status' | 'startsAt' | 'durationMinutes'>, now: number): SessionStatus {
  return status === 'confirmed' && now >= getSessionEndMs({ startsAt, durationMinutes }) ? 'awaiting_settlement' : status
}

// A one-way learner can only cancel. Anyone who teaches in the session can also offer new times.
export const canOfferAlternatives = ({ teacherId, swapType }: Pick<Session, 'teacherId' | 'swapType'>, userId: string) =>
  teacherId === userId || swapType === 'two_way'

const SOON_MINUTES = 60

// The session the dashboard should lead with: joinable now, or starting within the hour.
export function getImminentSession<T extends Pick<Session, 'startsAt' | 'durationMinutes'>>(sessions: T[], now: number): T | null {
  return (
    sessions.find((session) => {
      const state = getJoinState(session, now)
      return state === 'open' || (state === 'too_early' && Date.parse(session.startsAt) - now <= SOON_MINUTES * MINUTE_MS)
    }) ?? null
  )
}

// What a settled session did to the member's balance, for the history statement: +1 taught, -1 learned, 0 when
// no credit moved (a free swap, a free cancel, a refund after the teacher was absent, a teacher's late cancel, or
// nobody joining). A learner's late cancel still pays the teacher.
export function getCreditChange({ swapType, status, teacherId, noShow, cancellation }: Pick<Session, 'swapType' | 'status' | 'teacherId' | 'noShow' | 'cancellation'>, userId: string): number {
  if (swapType === 'two_way' || status === 'mutual_no_show') return 0
  if (status === 'cancelled' && !(cancellation?.late && cancellation.cancelledBy !== teacherId)) return 0
  if (status === 'no_show_confirmed' && noShow?.absentId === teacherId) return 0
  return teacherId === userId ? 1 : -1
}

// The statement's totals for the History heading: credits earned and spent across the listed sessions.
export function getHistoryTotals(sessions: Pick<Session, 'swapType' | 'status' | 'teacherId' | 'noShow' | 'cancellation'>[], userId: string) {
  const changes = sessions.map((session) => getCreditChange(session, userId))
  return { earned: changes.filter((n) => n > 0).length, spent: changes.filter((n) => n < 0).length }
}
