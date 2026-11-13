import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SocialProvider, User } from '../../types'
import { formatRelativeTime } from '../../utils/relativeTime'
import Avatar from '../common/Avatar'
import { getButtonClasses } from '../common/buttonStyles'
import ReliableBadge from '../common/ReliableBadge'
import StarRating from '../common/StarRating'
import ProviderIcon from '../common/ProviderIcon'

interface ProfileHeaderProps {
  user: User
  isSelf: boolean
}

const PROVIDER_LABELS: Record<SocialProvider, string> = { github: 'GitHub', google: 'Google' }

export default function ProfileHeader({ user, isSelf }: ProfileHeaderProps) {
  const [now] = useState(() => Date.now())

  return (
    // Unboxed, like the dashboard greeting: the page's one box of weight is the exchange note below.
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={user.name} url={user.avatarUrl} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{user.name}</h1>
          <p className="mt-0.5 text-pretty text-muted">{user.headline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <StarRating rating={user.rating} reviewCount={user.reviewCount} completedSessions={user.completedSessions} />
            {user.isReliable && <ReliableBadge />}
            <span><span className="figures font-medium">{user.completedSessions}</span> {user.completedSessions === 1 ? 'session' : 'sessions'} completed</span>
            <span className="text-muted">Active {formatRelativeTime(user.lastActiveAt, now)}</span>
            {user.socialLinks.length > 0 && (
              <ul className="contents">
                {user.socialLinks.map((link) => (
                  <li key={link.provider}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-ink underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ProviderIcon provider={link.provider} className="size-4" />
                      {PROVIDER_LABELS[link.provider]}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {isSelf && <Link to="/settings" className={getButtonClasses('secondary', 'shrink-0')}>Edit profile</Link>}
      </div>
    </section>
  )
}
