import type { SessionStatus } from '../../types'
import type { StatusTone } from '../common/StatusPill'

// One wording per session status, shared by session cards and the wallet's escrow details.
export const SESSION_PILLS: Record<SessionStatus, { label: string; tone: StatusTone }> = {
  pending: { label: 'Awaiting reply', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  awaiting_settlement: { label: 'Needs an outcome', tone: 'warning' },
  pending_learner_review: { label: 'Awaiting confirmation', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  // Covers both the 24-hour no-show check and an admin's review, so it names neither.
  disputed: { label: 'Under review', tone: 'danger' },
  no_show_confirmed: { label: 'No-show confirmed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}
