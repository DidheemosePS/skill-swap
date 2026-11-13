import { useNow } from '../../hooks/useNow'
import type { User } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import ReliableBadge from '../common/ReliableBadge'
import StarRating from '../common/StarRating'
import CreditCostSummary from './CreditCostSummary'

interface BookingSummaryProps {
  peer: User
  skillName: string
  returnSkillName: string | null
  isCredit: boolean
  credits: number | null
  existingSessionAt: string | null
}

const HOUR_MS = 3_600_000

// One block for everything this booking means: the trade, who with, what it costs, and any booking
// already in place, so the decision reads in one place rather than four.
export default function BookingSummary({ peer, skillName, returnSkillName, isCredit, credits, existingSessionAt }: BookingSummaryProps) {
  const now = useNow(30_000)
  const firstName = peer.name.split(' ')[0]
  // A session under way is said as one, not as a date that has already started.
  const isExistingLive = existingSessionAt !== null && Date.parse(existingSessionAt) <= now && now < Date.parse(existingSessionAt) + HOUR_MS

  return (
    <div className="mt-3 space-y-2 rounded-lg bg-canvas p-3 text-sm">
      <p>
        You learn <span className="font-semibold">{skillName}</span>
        {returnSkillName && <> · you teach <span className="font-semibold">{returnSkillName}</span></>}
      </p>
      <div className="flex flex-wrap items-center gap-x-3">
        <StarRating rating={peer.rating} reviewCount={peer.reviewCount} completedSessions={peer.completedSessions} />
        {peer.isReliable && <ReliableBadge />}
      </div>
      {isCredit && <CreditCostSummary firstName={firstName} credits={credits} />}
      {existingSessionAt && (
        <p className="border-t border-line pt-2">
          {isExistingLive ? (
            <>You're in a session with {firstName} right now. This books another.</>
          ) : (
            <>You already have a session with {firstName} on <span className="figures">{formatSlotDateTime(existingSessionAt)}</span>. This books another.</>
          )}
        </p>
      )}
    </div>
  )
}
