import type { MemberProfile } from '../../types'
import EmptyState from '../common/EmptyState'
import AvailabilityGrid from '../schedule/AvailabilityGrid'
import ProfileHeader from './ProfileHeader'
import ReviewCard from './ReviewCard'
import SkillMatrix from './SkillMatrix'

interface ProfileDetailsProps {
  profile: MemberProfile
}

export default function ProfileDetails({ profile }: ProfileDetailsProps) {
  const { peer: user, isSelf, reviews } = profile
  return (
    <div className="space-y-4">
      {isSelf && (
        <p className="rounded-lg bg-accent-soft p-4 text-sm font-medium text-accent-strong">
          This is how other members see your profile.
        </p>
      )}
      <ProfileHeader user={user} isSelf={isSelf} />
      <SkillMatrix teachSkills={user.teachSkills} learnSkills={user.learnSkills} />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Weekly availability</h2>
          {user.availability.slots.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No hours set" description="This member hasn't added any weekly hours yet." />
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                Shown in {user.availability.timezone}. Booking times use your timezone.
              </p>
              <div className="mt-3">
                <AvailabilityGrid availability={user.availability} />
              </div>
            </>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Recent reviews</h2>
          {reviews.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No reviews yet" description="Reviews appear here after completed sessions." />
            </div>
          ) : (
            <ul className="mt-4 space-y-5">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
