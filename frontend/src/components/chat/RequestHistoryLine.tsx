import { useCurrentUser } from '../../hooks/useAuth'
import type { SwapRequest } from '../../types'
import { requestNoun } from '../../utils/chat'
import { formatSlotDateTime } from '../../utils/timeSlots'

interface RequestHistoryLineProps {
  request: SwapRequest
  peerName: string
  timeLabel: string
}

const OUTCOMES: Record<SwapRequest['status'], string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  declined: 'declined',
  cancelled: 'cancelled',
  expired: 'expired',
}

// Requests in the stream are one-line history: the live one sits pinned above the thread, so earlier,
// closed requests can never be mistaken for it.
export default function RequestHistoryLine({ request, peerName, timeLabel }: RequestHistoryLineProps) {
  const { id: myId } = useCurrentUser()
  const firstName = peerName.split(' ')[0]
  const who = request.requesterId === myId ? 'You' : firstName
  const outcome = request.status === 'cancelled' && request.hasAlternatives
    ? `moved to new times by ${request.cancelledBy === myId ? 'you' : firstName}`
    : request.status === 'confirmed' && request.confirmedStartsAt
    ? `confirmed for ${formatSlotDateTime(request.confirmedStartsAt)}`
    : request.status === 'cancelled' && request.lastProposedBy === request.requesterId && !request.confirmedStartsAt
      ? 'withdrawn'
      : OUTCOMES[request.status]
  const paidBack = request.status !== 'pending' && request.status !== 'confirmed' && !request.hasAlternatives && request.swapType === 'one_way' && request.learnerId === myId

  return (
    <p data-request-id={request.id} className="mx-auto w-fit max-w-full rounded-full border border-line bg-surface px-3 py-1 text-center text-xs text-pretty text-muted">
      {who} sent a {requestNoun(request.swapType)} · {outcome}
      {paidBack && ' · credit returned'} · <span className="figures">{timeLabel}</span>
    </p>
  )
}
