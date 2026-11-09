import { Link } from 'react-router-dom'
import type { LedgerEntry, SessionStatus } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import { SESSION_PILLS } from '../cards/sessionStatusPills'
import { getButtonClasses } from '../common/buttonStyles'
import StatusPill from '../common/StatusPill'

// What has to happen before the held credit moves, in the member's own terms.
function describeHold(status: SessionStatus, firstName: string): string {
  switch (status) {
    case 'pending':
      return `Held for the new times ${firstName} offered. It's refunded if the request closes without being accepted.`
    case 'confirmed':
      return `Held until the session ends. It goes to ${firstName} once you confirm the session went ahead.`
    case 'awaiting_settlement':
      return `The session has ended. Mark it completed to release the credit to ${firstName}.`
    case 'pending_learner_review':
      return `${firstName} marked it completed. It's released when you confirm, or automatically 48 hours after their marking.`
    case 'disputed':
      return 'Held while this session is under review.'
    default:
      return 'Held for this booking.'
  }
}

export default function EscrowDetails({ entry }: { entry: LedgerEntry }) {
  const { session, partner } = entry
  if (!session || !partner) return <p className="text-sm text-muted">The booking details for this hold aren't available.</p>

  const firstName = partner.name.split(' ')[0]
  const pill = SESSION_PILLS[session.status]
  // A pending session is a request with new times, which is answered in the chat, not on the Sessions page.
  const link = session.status === 'pending'
    ? { to: `/messages?peer=${partner.id}`, label: 'Open chat' }
    : { to: '/sessions', label: 'View in Sessions' }

  return (
    <div className="rounded-lg bg-canvas p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{session.skillName} with {partner.name}</p>
          <p className="text-muted">{formatSlotDateTime(session.startsAt)}</p>
        </div>
        <StatusPill label={pill.label} tone={pill.tone} />
      </div>
      <p className="mt-3 max-w-prose">{describeHold(session.status, firstName)}</p>
      <Link to={link.to} className={`${getButtonClasses('secondary')} mt-3`}>{link.label}</Link>
    </div>
  )
}
