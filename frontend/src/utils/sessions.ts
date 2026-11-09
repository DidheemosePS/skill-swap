import type { Session, SessionStatus } from '../types'

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

export const REVIEW_WINDOW_HOURS = 48
export const AUTO_RESOLVE_HOURS = 72
export const NO_SHOW_VERIFICATION_HOURS = 24

export const getReviewWindowEndMs = (teacherMarkedAt: string) => Date.parse(teacherMarkedAt) + REVIEW_WINDOW_HOURS * 3_600_000

// When a no-show report has been checked against the meeting records.
export const getVerificationEndMs = (raisedAt: string) => Date.parse(raisedAt) + NO_SHOW_VERIFICATION_HOURS * 3_600_000

export const getAutoResolveEndMs = (session: Pick<Session, 'startsAt' | 'durationMinutes'>) =>
  getSessionEndMs(session) + AUTO_RESOLVE_HOURS * 3_600_000

// A teacher can't pay themselves: only the learner's word releases a one-way credit at once.
// A two-way swap moves no credit, so either member can close it.
export const releasesCreditNow = ({ swapType, learnerId }: Pick<Session, 'swapType' | 'learnerId'>, userId: string) =>
  swapType === 'two_way' || learnerId === userId

// A confirmed session that has ended needs an outcome, even if the server hasn't said so yet.
export function getSessionPhase({ status, startsAt, durationMinutes }: Pick<Session, 'status' | 'startsAt' | 'durationMinutes'>, now: number): SessionStatus {
  return status === 'confirmed' && now >= getSessionEndMs({ startsAt, durationMinutes }) ? 'awaiting_settlement' : status
}

// A one-way learner can only cancel. Anyone who teaches in the session can also offer new times.
export const canOfferAlternatives = ({ teacherId, swapType }: Pick<Session, 'teacherId' | 'swapType'>, userId: string) =>
  teacherId === userId || swapType === 'two_way'
