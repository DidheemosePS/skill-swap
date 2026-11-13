import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ExchangeNote from '../components/cards/ExchangeNote'
import ProfileDetails from '../components/cards/ProfileDetails'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import SwapRequestModal from '../components/schedule/SwapRequestModal'
import { useAsyncData } from '../hooks/useAsyncData'
import { useWallet } from '../hooks/useWallet'
import { fetchMemberProfile } from '../services/profileService'
import type { TimeSlot } from '../types'
import { slotKey } from '../utils/availability'
import { toViewerWeek } from '../utils/timeSlots'
import { ProfileSkeleton } from '../components/common/pageSkeletons'

export default function UserProfilePage() {
  const { id = '' } = useParams()
  const wallet = useWallet()
  const fetchProfile = useCallback(() => fetchMemberProfile(id), [id])
  const { data, status, retry } = useAsyncData(fetchProfile)
  const [isRequesting, setIsRequesting] = useState(false)
  // A both-free hour tapped on the grid, picked for the member when the booking form opens.
  const [pickedSlot, setPickedSlot] = useState<TimeSlot | null>(null)
  // Fixed for the visit: weekly hours only shift when a clock change crosses the week, which a reload covers.
  const [now] = useState(() => Date.now())

  // Unlike Explore, a refetch here means a different person, so old data must never stay on screen.
  const profile = status === 'ready' ? data : null
  const credits = wallet.status === 'ready' ? (wallet.wallet?.credits ?? null) : null
  // Both members' weeks in the viewer's clock, read once per profile, so the note, grid and picker agree.
  const weeks = useMemo(() => {
    if (!profile) return null
    const theirWeek = toViewerWeek(profile.peer.availability, now)
    const yourWeek = profile.viewerAvailability ? toViewerWeek(profile.viewerAvailability, now) : null
    const yourKeys = new Set(yourWeek?.slots.map(slotKey) ?? [])
    return { theirWeek, yourWeek, shared: theirWeek.slots.filter((slot) => yourKeys.has(slotKey(slot))) }
  }, [profile, now])

  return (
    <>
      <title>{profile ? `${profile.peer.name} · Skill Swap` : 'Profile · Skill Swap'}</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className="outline-none mx-auto max-w-page px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        {status === 'loading' && (
          <div role="status" aria-label="Loading profile"><ProfileSkeleton /></div>
        )}
        {status === 'error' && <AlertBanner message="We couldn't load this profile." onRetry={retry} />}
        {status === 'ready' && !profile && (
          <EmptyState
            icon="search"
            title="Member not found"
            description="This profile doesn't exist or is no longer available."
            action={<Link to="/explore" className={getButtonClasses('secondary')}>Explore members</Link>}
          />
        )}
        {profile && weeks && (
          <ProfileDetails
            profile={profile}
            theirWeek={weeks.theirWeek}
            yourWeek={weeks.yourWeek}
            onPickSlot={
              profile.isSelf || profile.hasPendingRequest
                ? undefined
                : (slot) => {
                    setPickedSlot(slot)
                    setIsRequesting(true)
                  }
            }
            exchange={
              !profile.isSelf && (
                <ExchangeNote
                  profile={profile}
                  theirWeek={weeks.theirWeek}
                  yourWeek={weeks.yourWeek}
                  credits={credits}
                  walletStatus={wallet.status}
                  onRetryWallet={wallet.refresh}
                  onRequest={() => {
                    setPickedSlot(null)
                    setIsRequesting(true)
                  }}
                />
              )
            }
          />
        )}
      </main>

      {profile && isRequesting && (
        <SwapRequestModal
          offer={profile}
          credits={credits}
          existingSessionAt={profile.nextSessionAt}
          sharedSlots={weeks?.shared}
          initialSlot={pickedSlot}
          onClose={() => setIsRequesting(false)}
        />
      )}
    </>
  )
}
