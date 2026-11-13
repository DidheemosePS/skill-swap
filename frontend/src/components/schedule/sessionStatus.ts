import type { SessionDetail, SessionStatus } from '../../types'
import { getVerificationEndMs } from '../../utils/sessions'

// Whether the member acts next, someone else does, or it's settled. Rows print "you" statuses in ink and
// everyone else's in muted text, so the eye finds its own jobs first.
export type StatusOwner = 'you' | 'others' | 'settled'

// One status vocabulary for every ended session, shared by To confirm and History, so a
// session reads the same wherever it sits and two rows with the same partner can't be confused.
export function getSessionStatus(session: SessionDetail, phase: SessionStatus, myId: string, now: number): { label: string; owner: StatusOwner } {
  const first = session.partner.name.split(' ')[0]
  switch (phase) {
    case 'awaiting_settlement':
      return { label: 'Your turn to answer', owner: 'you' }
    case 'pending_learner_review':
      return session.isTeaching ? { label: `${first}'s turn to confirm`, owner: 'others' } : { label: 'Your turn to confirm', owner: 'you' }
    case 'disputed': {
      const { dispute } = session
      // A no-show report is checked against the meeting records for 24 hours; after that, or for any other dispute, an admin decides.
      const isChecking = dispute?.cause === 'no_show' && getVerificationEndMs(dispute.raisedAt) > now
      return { label: isChecking ? 'No-show reported · checking records' : 'Disputed · admin reviewing', owner: 'others' }
    }
    case 'no_show_confirmed':
      return { label: `No-show · ${session.noShow?.absentId === myId ? "you didn't attend" : `${first} didn't attend`}`, owner: 'settled' }
    case 'cancelled':
      return { label: 'Cancelled', owner: 'settled' }
    case 'completed':
      return { label: 'Completed', owner: 'settled' }
    default:
      return { label: 'Booked', owner: 'others' }
  }
}
