import type { SessionDetail, SessionStatus } from '../../types'

// Whether the member acts next, someone else does, or it's settled. Rows print "you" statuses in ink and
// everyone else's in muted text, so the eye finds its own jobs first.
export type StatusOwner = 'you' | 'others' | 'settled'

// One status vocabulary for every ended session, shared by Settling, Under review and Past, so a
// session reads the same wherever it sits and two rows with the same partner can't be confused.
export function getSessionStatus(session: SessionDetail, phase: SessionStatus, myId: string): { label: string; owner: StatusOwner } {
  const first = session.partner.name.split(' ')[0]
  switch (phase) {
    case 'awaiting_settlement':
      return { label: 'Settling', owner: 'others' }
    case 'disputed':
      return { label: 'Concern raised · admin reviewing', owner: 'others' }
    case 'no_show_confirmed':
      return { label: `No-show · ${session.noShow?.absentId === myId ? "you didn't attend" : `${first} didn't attend`}`, owner: 'settled' }
    case 'mutual_no_show':
      return { label: 'Neither joined', owner: 'settled' }
    case 'cancelled':
      return { label: session.cancellation?.late ? 'Cancelled late' : 'Cancelled', owner: 'settled' }
    case 'completed':
      return { label: 'Completed', owner: 'settled' }
    default:
      return { label: 'Booked', owner: 'others' }
  }
}
