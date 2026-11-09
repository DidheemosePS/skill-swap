import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { MemberProfile } from '../../types'
import AlertBanner from '../common/AlertBanner'
import BookedSessionNote from '../common/BookedSessionNote'
import Button from '../common/Button'
import { getButtonClasses } from '../common/buttonStyles'

interface ProfileActionBarProps {
  profile: MemberProfile
  credits: number | null
  walletStatus: AsyncStatus
  onRetryWallet: () => void
  onRequest: () => void
}

function getSummary({ swapType, peer }: MemberProfile, credits: number | null) {
  const firstName = peer.name.split(' ')[0]
  if (swapType === 'two_way') return `You and ${firstName} can teach each other for free.`
  return credits === null ? 'Costs 1 credit.' : `Costs 1 credit. Your balance: ${credits}.`
}

function getActionLabel({ nextSessionAt, swapType }: MemberProfile) {
  if (nextSessionAt) return 'Book Another Session'
  return swapType === 'two_way' ? 'Request Free 2-Way Swap' : 'Book Session with 1 Credit'
}

export default function ProfileActionBar({ profile, credits, walletStatus, onRetryWallet, onRequest }: ProfileActionBarProps) {
  const isTwoWay = profile.swapType === 'two_way'
  // A one-way booking needs a known balance, so without one the button stays off until a retry works.
  const isBalanceMissing = !isTwoWay && walletStatus !== 'ready'
  return (
    <div className="sticky bottom-0 z-10 border-t border-line bg-surface">
      {!isTwoWay && walletStatus === 'error' && (
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <AlertBanner message="We couldn't load your balance, so booking is paused." onRetry={onRetryWallet} />
        </div>
      )}
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <BookedSessionNote startsAt={profile.nextSessionAt} />
          <p className="text-sm text-muted">{getSummary(profile, credits)}</p>
        </div>
        {profile.hasPendingRequest ? (
          <Link to={`/messages?peer=${profile.peer.id}`} className={getButtonClasses('secondary', 'shrink-0')}>Request pending</Link>
        ) : (
          <Button
            onClick={onRequest}
            // Waits for the balance, so a 0-credit member sees the earn-credits prompt rather than the booking form.
            disabled={profile.teachesYou.length === 0 || isBalanceMissing}
            className="shrink-0"
          >
            {getActionLabel(profile)}
          </Button>
        )}
      </div>
    </div>
  )
}
