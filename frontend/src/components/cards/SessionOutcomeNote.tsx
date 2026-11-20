import { useCurrentUser } from '../../hooks/useAuth'
import type { SessionDetail } from '../../types'
import { getSettlingLine } from '../schedule/settlingCopy'

interface SessionOutcomeNoteProps {
  session: SessionDetail
  now: number
}

function Quote({ label, text }: { label: string; text: string }) {
  return (
    <blockquote className="mt-2 rounded-lg bg-canvas p-3 text-sm [overflow-wrap:anywhere]">
      <p className="mb-1 text-xs font-medium text-muted">{label}</p>
      {text}
    </blockquote>
  )
}

// What happened after a session ended, and where the credit stands, in the card's own words.
export default function SessionOutcomeNote({ session, now }: SessionOutcomeNoteProps) {
  const { id: myId } = useCurrentUser()
  const { partner, swapType, isTeaching, dispute, cancellation } = session
  const firstName = partner.name.split(' ')[0]
  const whose = (userId: string) => (userId === myId ? 'Your reason' : `${firstName}'s reason`)
  const muted = 'mt-1 text-sm text-muted'

  if (session.status === 'awaiting_settlement') return <p className={muted}>{getSettlingLine(session, now)}</p>
  if (session.status === 'disputed' && dispute) {
    // Whose credit is waiting, named with its noun, never "escrow": the same word as the navbar's "held".
    const held = swapType === 'two_way' ? 'No credit at stake' : isTeaching ? `${firstName}'s credit held` : 'Your credit held'
    return (
      <>
        <Quote label={whose(dispute.raisedBy)} text={dispute.reason} />
        <p className={muted}>An admin decides from the meeting records · {held}</p>
      </>
    )
  }
  if (session.status === 'cancelled' && cancellation) return <Quote label={whose(cancellation.cancelledBy)} text={cancellation.reason} />
  return null
}
