import { useState } from 'react'
import { useCurrentUser } from '../../hooks/useAuth'
import type { SessionDetail } from '../../types'
import { releasesCreditNow, REVIEW_WINDOW_HOURS } from '../../utils/sessions'
import ConfirmCompletionDrawer from './ConfirmCompletionDrawer'
import PostSessionDrawer from './PostSessionDrawer'
import ReviewModal from './ReviewModal'

interface SettleSessionDialogsProps {
  // The session the member chose to settle from the dashboard; null when nothing is open.
  session: SessionDetail | null
  // Which step it's at: marking the outcome, or confirming a teacher's completion as the learner.
  mode: 'resolve' | 'confirm'
  onClose: () => void
  // Credits can move, so the caller reloads sessions and the wallet, and says what happened.
  onSettled: (message: string) => void
}

// The same settle-then-rate flow the Sessions page runs, so a held credit can be released from the dashboard.
export default function SettleSessionDialogs({ session, mode, onClose, onSettled }: SettleSessionDialogsProps) {
  const myId = useCurrentUser().id
  // Rating comes straight after a session closes, while it's fresh; it outlives the drawer that led to it.
  const [reviewing, setReviewing] = useState<SessionDetail | null>(null)
  // Held until the rating step closes, so the notice describes the settle rather than the review.
  const [settledMessage, setSettledMessage] = useState('')

  function finish() {
    setReviewing(null)
    onSettled(settledMessage)
  }

  if (reviewing) return <ReviewModal session={reviewing} onClose={finish} onSubmitted={finish} />
  if (!session) return null
  const firstName = session.partner.name.split(' ')[0]
  if (mode === 'confirm') {
    return (
      <ConfirmCompletionDrawer
        session={session}
        onClose={onClose}
        onConfirmed={() => {
          const message = `Confirmed · ${firstName} got your credit. Nice hour of learning.`
          onSettled(message)
          setSettledMessage(message)
          setReviewing(session)
        }}
        onDisputed={() => onSettled(`Dispute sent · your credit stays held while it's reviewed`)}
      />
    )
  }
  return (
    <PostSessionDrawer
      session={session}
      onClose={onClose}
      // A teacher's marking doesn't close a one-way session, so there's nothing to rate yet.
      onCompleted={() => {
        const releases = releasesCreditNow(session, myId)
        const message = session.swapType === 'two_way'
          ? `Swap complete · another hour taught with ${firstName}`
          : releases
            ? `Done · ${firstName} got your credit`
            : `Marked complete · +1 credit comes when ${firstName} confirms (${REVIEW_WINDOW_HOURS} h max)`
        onSettled(message)
        setSettledMessage(message)
        if (releases) setReviewing(session)
      }}
      onReported={() => onSettled(`No-show reported · it's under To confirm while records are checked`)}
    />
  )
}
