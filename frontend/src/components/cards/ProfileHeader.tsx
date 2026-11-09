import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SocialProvider, User } from '../../types'
import { formatRelativeTime } from '../../utils/relativeTime'
import Avatar from '../common/Avatar'
import { getButtonClasses } from '../common/buttonStyles'
import StarRating from '../common/StarRating'

interface ProfileHeaderProps {
  user: User
  isSelf: boolean
}

const PROVIDER_LABELS: Record<SocialProvider, string> = { github: 'GitHub', google: 'Google' }

export default function ProfileHeader({ user, isSelf }: ProfileHeaderProps) {
  const [now] = useState(() => Date.now())
  const sessionLabel = user.completedSessions === 1 ? '1 session completed' : `${user.completedSessions} sessions completed`

  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={user.name} url={user.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-balance sm:text-3xl">{user.name}</h1>
          <p className="mt-1 text-muted">{user.headline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <StarRating rating={user.rating} reviewCount={user.reviewCount} />
            {user.isReliable && (
              <span className="text-muted"><span aria-hidden="true">🛡️ </span>Reliable Swapper</span>
            )}
            <span className="font-medium">{sessionLabel}</span>
            <span className="text-muted">Active {formatRelativeTime(user.lastActiveAt, now)}</span>
          </div>
          <p className="mt-4 max-w-prose">{user.bio}</p>
          {user.socialLinks.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-4">
              {user.socialLinks.map((link) => (
                <li key={link.provider}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-sm font-medium text-accent-strong underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {PROVIDER_LABELS[link.provider]}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {isSelf && <Link to="/settings" className={getButtonClasses('secondary', 'shrink-0')}>Edit profile</Link>}
      </div>
    </section>
  )
}
