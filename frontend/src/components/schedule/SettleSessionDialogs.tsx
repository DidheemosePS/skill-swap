import { useState } from 'react'
import type { SessionDetail } from '../../types'
import { getExpectedOutcome } from '../../utils/sessions'
import ReviewModal from './ReviewModal'
import SettlingDrawer, { type SettleStep } from './SettlingDrawer'
import { getConfirmedMessage } from './settlingCopy'

interface SettleSessionDialogsProps {
  // The settling session the member opened; null when nothing is open.
  session: SessionDetail | null
  step: SettleStep
  onClose: () => void
  // Credits can move, so the caller reloads sessions and the wallet, and says what happened.
  onSettled: (message: string) => void
}

// The same settle-then-rate flow on the Dashboard, Sessions and Messages.
export default function SettleSessionDialogs({ session, step, onClose, onSettled }: SettleSessionDialogsProps) {
  // Rating comes straight after a session completes, while it's fresh; it outlives the drawer that led to it.
  const [reviewing, setReviewing] = useState<SessionDetail | null>(null)
  // Held until the rating step closes, so the notice describes the settle rather than the review.
  const [settledMessage, setSettledMessage] = useState('')

  function finish() {
    setReviewing(null)
    onSettled(settledMessage)
  }

  if (reviewing) return <ReviewModal session={reviewing} onClose={finish} onSubmitted={finish} />
  if (!session) return null
  return (
    <SettlingDrawer
      key={`${session.id}-${step}`}
      session={session}
      step={step}
      onClose={onClose}
      onConfirmed={(settled) => {
        const message = getConfirmedMessage(session, settled, Date.now())
        onSettled(message)
        // Only a session both members attended can be rated.
        if (!settled || getExpectedOutcome(session) !== 'completed') return
        setSettledMessage(message)
        setReviewing(session)
      }}
      onConcernRaised={() => onSettled('Concern sent. The credit stays held while an admin reviews it.')}
    />
  )
}
