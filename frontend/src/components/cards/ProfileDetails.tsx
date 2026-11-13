import type { ReactNode } from 'react'
import type { MemberProfile, TimeSlot, WeeklyAvailability } from '../../types'
import EmptyState from '../common/EmptyState'
import AvailabilityGrid from '../schedule/AvailabilityGrid'
import ProfileHeader from './ProfileHeader'
import ReviewCard from './ReviewCard'
import SkillMatrix from './SkillMatrix'

interface ProfileDetailsProps {
  profile: MemberProfile
  // The exchange note, placed between who they are and the detail that backs it up.
  exchange: ReactNode
  // Their hours and the viewer's, both already in the viewer's timezone.
  theirWeek: WeeklyAvailability
  yourWeek: WeeklyAvailability | null
  // Starts a booking at a both-free hour tapped on the grid.
  onPickSlot?: (slot: TimeSlot) => void
}

const weeksShareHours = (theirs: WeeklyAvailability, yours: WeeklyAvailability) =>
  theirs.slots.some((slot) => yours.slots.some((other) => other.day === slot.day && other.startHour === slot.startHour))

function Panel({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line px-4 py-3 sm:px-5">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        {aside && <span className="text-sm text-muted">{aside}</span>}
      </div>
      {/* Children bring their own top margin, as they did under the old ruled heading. */}
      <div className="px-4 pb-5 sm:px-5">{children}</div>
    </section>
  )
}

export default function ProfileDetails({ profile, exchange, theirWeek, yourWeek, onPickSlot }: ProfileDetailsProps) {
  const { peer: user, isSelf, reviews, swapType, teachesYou, learnsFromYou } = profile
  const firstName = user.name.split(' ')[0]
  // A one-way offer lists every skill they teach as learnable, so only a two-way swap marks real matches.
  const isTwoWay = swapType === 'two_way'

  return (
    <div className="space-y-6">
      {isSelf && (
        <p className="rounded-lg bg-surface p-3 text-sm text-ink">
          How others see your profile.
        </p>
      )}
      <ProfileHeader user={user} isSelf={isSelf} />
      {exchange}

      {/* About, then when you can meet, then reviews: on phones the hours come before the long review list;
          from lg the hours take the right column beside both. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <Panel title="About">
          {user.bio && <p className="mt-3 max-w-prose text-pretty">{user.bio}</p>}
          <div className="mt-4">
            <SkillMatrix
              teachSkills={user.teachSkills}
              learnSkills={user.learnSkills}
              teachesYou={isTwoWay ? teachesYou : []}
              learnsFromYou={isSelf ? [] : learnsFromYou}
            />
          </div>
        </Panel>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Panel title={isSelf ? 'Weekly hours' : 'When you can meet'} aside={`Your time · ${theirWeek.timezone}`}>
            {user.availability.slots.length === 0 ? (
              <div className="mt-3">
                <EmptyState icon="clock" tone="inset" title="No hours set" description={`${isSelf ? 'You haven’t' : `${firstName} hasn’t`} added any weekly hours yet.`} />
              </div>
            ) : (
              <>
                {yourWeek && onPickSlot && weeksShareHours(theirWeek, yourWeek) && <p className="mt-3 text-sm text-muted">Pick a both-free hour to book.</p>}
                {yourWeek && (
                  <ul aria-label="Key" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    {/* Only the states this grid shows, so the key never lists one that isn't there. */}
                    {weeksShareHours(theirWeek, yourWeek) && (
                      <li className="flex items-center gap-1.5"><span aria-hidden="true" className="relative size-3 rounded-sm bg-next"><span className="absolute top-1/2 left-1/2 size-1 -translate-1/2 rounded-full bg-white" /></span>Both free</li>
                    )}
                    <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-sm bg-muted/45" />Only {firstName}</li>
                    <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-sm outline-[1.5px] outline-dashed -outline-offset-2 outline-muted" />Only you</li>
                    <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-sm border border-line bg-next-soft" />Neither</li>
                  </ul>
                )}
                <div className="mt-3">
                  <AvailabilityGrid availability={theirWeek} overlay={yourWeek ? { availability: yourWeek, theirName: firstName } : undefined} onPick={onPickSlot} />
                </div>
              </>
            )}
          </Panel>
        </div>

        <Panel
          title="Reviews"
          aside={reviews.length > 0 ? <>Latest <span className="figures">{reviews.length}</span> of <span className="figures">{user.reviewCount}</span></> : undefined}
        >
          {reviews.length === 0 ? (
            <div className="mt-3">
              <EmptyState icon="star" tone="inset" title="No reviews yet" description="Reviews appear here after completed sessions." />
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
