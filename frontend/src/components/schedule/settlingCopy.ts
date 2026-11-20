import type { SessionDetail } from '../../types'
import { getExpectedOutcome, getSettlesAtMs } from '../../utils/sessions'
import { formatSlotDateTime, formatSlotTime } from '../../utils/timeSlots'

const DAY_MS = 86_400_000
const dayKey = (ms: number) => new Date(ms).toDateString()

// "at 19:00 tomorrow" reads faster than a date, and the settle time is always within a day or two.
export function formatSettleTime(ms: number, now: number) {
  const iso = new Date(ms).toISOString()
  if (dayKey(ms) === dayKey(now)) return `at ${formatSlotTime(iso)} today`
  if (dayKey(ms) === dayKey(now + DAY_MS)) return `at ${formatSlotTime(iso)} tomorrow`
  return `on ${formatSlotDateTime(iso)}`
}

// What happened to the credit, said from this member's side. Empty for a free swap, where no credit moves.
function creditLine(session: SessionDetail, toTeacher: boolean, when: string) {
  const first = session.partner.name.split(' ')[0]
  if (session.swapType === 'two_way') return `It's recorded ${when}.`
  if (toTeacher) return session.isTeaching ? `Your credit from ${first} arrives ${when}.` : `Your credit goes to ${first} ${when}.`
  return session.isTeaching ? `${first}'s credit goes back to them ${when}.` : `Your credit comes back ${when}.`
}

// The outcome the attendance records show and when it settles, in one or two short sentences:
// "You both joined. Your credit goes to Dina at 19:00 tomorrow."
export function getSettlingLine(session: SessionDetail, now: number) {
  const first = session.partner.name.split(' ')[0]
  const when = formatSettleTime(getSettlesAtMs(session), now)
  const outcome = getExpectedOutcome(session)
  const iWasAbsent = (outcome === 'no_show_teacher') === session.isTeaching
  if (outcome === 'completed') return `You both joined. ${creditLine(session, true, when)}`
  if (outcome === 'mutual_no_show') return `Neither of you joined. ${creditLine(session, false, when)}`
  const who = iWasAbsent ? "You didn't join." : `${first} didn't join.`
  return `${who} ${creditLine(session, outcome === 'no_show_learner', when)}`
}

// Said after Confirm now: settled at once when the partner had confirmed already, otherwise still waiting.
export function getConfirmedMessage(session: SessionDetail, settled: boolean, now: number) {
  const first = session.partner.name.split(' ')[0]
  if (!settled) return `Confirmed. It settles once ${first} confirms too, or ${formatSettleTime(getSettlesAtMs(session), now)}.`
  const outcome = getExpectedOutcome(session)
  if (session.swapType === 'two_way') return `Settled. Your session with ${first} is recorded.`
  const toTeacher = outcome === 'completed' || outcome === 'no_show_learner'
  if (toTeacher) return session.isTeaching ? `Settled. +1 credit from ${first}.` : `Settled. Your credit went to ${first}.`
  return session.isTeaching ? `Settled. ${first}'s credit went back to them.` : 'Settled. Your credit is back.'
}
