import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import { useNow } from '../../hooks/useNow'
import type { UpcomingSession } from '../../types'
import AlertBanner from '../common/AlertBanner'
import { getButtonClasses } from '../common/buttonStyles'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import SessionRow from './SessionRow'

interface UpcomingSessionsWidgetProps {
  sessions: UpcomingSession[]
  status: AsyncStatus
  onRetry: () => void
}

const MAX_SESSIONS = 3

export default function UpcomingSessionsWidget({ sessions, status, onRetry }: UpcomingSessionsWidgetProps) {
  const now = useNow()

  return (
    <section aria-labelledby="upcoming-heading" className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="upcoming-heading" className="font-semibold">Upcoming sessions</h2>
        <Link to="/sessions" className="rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
          View all
        </Link>
      </div>
      <div className="mt-4">
        {status === 'loading' && (
          <div role="status" aria-label="Loading sessions">
            <Skeleton className="h-44" />
          </div>
        )}
        {status === 'error' && <AlertBanner message="We couldn't load your sessions." onRetry={onRetry} />}
        {status === 'ready' && sessions.length === 0 && (
          <EmptyState
            title="No sessions booked"
            description="Request a swap with a match to book your first session."
            action={<Link to="/explore" className={getButtonClasses('secondary')}>Find a mentor</Link>}
          />
        )}
        {status === 'ready' && sessions.length > 0 && (
          <ul>
            {sessions.slice(0, MAX_SESSIONS).map((session, index) => (
              // Only two on small screens, so the match feed stays close to the top of the page.
              <li key={session.id} className={`not-first:mt-4 not-first:border-t not-first:border-line not-first:pt-4 ${index >= 2 ? 'hidden lg:block' : ''}`}>
                <SessionRow session={session} now={now} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
