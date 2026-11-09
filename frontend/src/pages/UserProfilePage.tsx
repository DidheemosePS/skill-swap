import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProfileActionBar from '../components/cards/ProfileActionBar'
import ProfileDetails from '../components/cards/ProfileDetails'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import Skeleton from '../components/common/Skeleton'
import SwapRequestModal from '../components/schedule/SwapRequestModal'
import { useAsyncData } from '../hooks/useAsyncData'
import { useWallet } from '../hooks/useWallet'
import { fetchMemberProfile } from '../services/profileService'

export default function UserProfilePage() {
  const { id = '' } = useParams()
  const wallet = useWallet()
  const fetchProfile = useCallback(() => fetchMemberProfile(id), [id])
  const { data, status, retry } = useAsyncData(fetchProfile)
  const [isRequesting, setIsRequesting] = useState(false)

  // Unlike Explore, a refetch here means a different person, so old data must never stay on screen.
  const profile = status === 'ready' ? data : null
  const credits = wallet.status === 'ready' ? (wallet.wallet?.credits ?? null) : null

  return (
    <>
      <title>{profile ? `${profile.peer.name} · Skill Swap` : 'Profile · Skill Swap'}</title>
      <AppNavbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {status === 'loading' && (
          <div role="status" aria-label="Loading profile" className="space-y-4">
            <Skeleton className="h-52 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        )}
        {status === 'error' && <AlertBanner message="We couldn't load this profile." onRetry={retry} />}
        {status === 'ready' && !profile && (
          <EmptyState
            title="Member not found"
            description="This profile doesn't exist or is no longer available."
            action={<Link to="/explore" className={getButtonClasses('secondary')}>Explore members</Link>}
          />
        )}
        {profile && <ProfileDetails profile={profile} />}
      </main>

      {profile && !profile.isSelf && (
        <ProfileActionBar
          profile={profile}
          credits={credits}
          walletStatus={wallet.status}
          onRetryWallet={wallet.refresh}
          onRequest={() => setIsRequesting(true)}
        />
      )}
      {profile && isRequesting && (
        <SwapRequestModal offer={profile} credits={credits} onClose={() => setIsRequesting(false)} />
      )}
    </>
  )
}
