import { Link } from 'react-router-dom'
import type { DirectoryMember } from '../../types'
import { formatRelativeTime } from '../../utils/relativeTime'
import Avatar from '../common/Avatar'
import BookedSessionNote from '../common/BookedSessionNote'
import { getButtonClasses } from '../common/buttonStyles'
import SkillLine from '../common/SkillLine'
import StarRating from '../common/StarRating'

interface MentorCardProps {
  member: DirectoryMember
  now: number
}

export default function MentorCard({ member, now }: MentorCardProps) {
  const { user, swapType, hasPendingRequest, nextSessionAt } = member
  const profilePath = `/user/${user.id}`
  return (
    <article className="relative flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition duration-150 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} url={user.avatarUrl} />
        <div className="min-w-0">
          <h2 className="font-semibold">
            {/* The ::after layer stretches this link over the card, so the whole card is one target.
                It's on the name because a hover transform here would shrink that layer. */}
            <Link to={profilePath} className="rounded outline-none after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:ring-2 focus-visible:ring-accent">
              {user.name}
            </Link>
          </h2>
          <p className="text-sm text-muted">{user.headline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRating rating={user.rating} reviewCount={user.reviewCount} />
        {user.isReliable && (
          <span className="text-sm text-muted"><span aria-hidden="true">🛡️ </span>Reliable Swapper</span>
        )}
      </div>

      <div className="mt-4 mb-4 space-y-2">
        <SkillLine label="Teaches" names={user.teachSkills.map(({ skill }) => skill.name)} />
        <SkillLine label="Wants to learn" names={user.learnSkills.map(({ skill }) => skill.name)} />
      </div>

      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <BookedSessionNote startsAt={nextSessionAt} />
        <p className="flex justify-between gap-3 text-sm">
          <span className="font-medium">{swapType === 'two_way' ? 'Free 2-way swap' : '1 credit'}</span>
          <span className="text-muted">Active {formatRelativeTime(user.lastActiveAt, now)}</span>
        </p>
        {/* z-10 lifts the button above the card's stretched link, so it can go somewhere else. */}
        <Link
          to={hasPendingRequest ? `/messages?peer=${user.id}` : profilePath}
          className={getButtonClasses('secondary', 'relative z-10 mt-3 w-full')}
        >
          {hasPendingRequest ? 'Request pending' : <>View Profile &amp; Request</>}
        </Link>
      </div>
    </article>
  )
}
