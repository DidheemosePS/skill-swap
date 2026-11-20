import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import { useNow } from '../../hooks/useNow'
import type { UpcomingSession } from '../../types'
import { getJoinState } from '../../utils/sessions'
import { formatSlotTime } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import EmptyState from '../common/EmptyState'
import JoinMeetingButton from '../schedule/JoinMeetingButton'
import { ComingUpBody } from '../common/pageSkeletons'

interface ComingUpPanelProps {
  status: AsyncStatus
  upcoming: UpcomingSession[]
  // Shown in the "now" card instead, so it isn't listed twice.
  imminentId: string | null
}

// The schedule is the list that grows, so the panel shows the next few and the Sessions page has the rest.
const MAX_SHOWN = 3

// Booked sessions as a small calendar: the day, the person, what and when. Changes happen on Sessions, so the
// only action here is Join once a session opens.
export default function ComingUpPanel({ status, upcoming, imminentId }: ComingUpPanelProps) {
  const now = useNow(30_000)
  const booked = upcoming.filter((session) => session.id !== imminentId)

  return (
    <section aria-labelledby="coming-up-heading" className="rounded-2xl border border-line bg-card p-5 pb-2">
      <div className="flex items-center justify-between gap-3">
        <h2 id="coming-up-heading" className="font-display text-lg font-semibold text-ink">Coming up</h2>
        <Link to="/sessions" className="inline-flex min-h-9 items-center rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">All</Link>
      </div>
      {status === 'loading' && booked.length === 0 && <div role="status" aria-label="Loading sessions"><ComingUpBody /></div>}
      {status !== 'loading' && booked.length === 0 && <div className="pt-3 pb-3"><EmptyState icon="calendar" tone="inset" title="Nothing else booked yet" /></div>}
      {booked.length > 0 && (
        <ul className="mt-1">
          {booked.slice(0, MAX_SHOWN).map((session) => {
            const date = new Date(session.startsAt)
            const firstName = session.partner.name.split(' ')[0]
            return (
              <li key={session.id} className="flex items-center gap-3 border-t border-line/70 py-3 first:border-t-0">
                <p aria-hidden="true" className="w-10 shrink-0 text-center leading-tight">
                  <span className="block text-[0.6875rem] font-semibold text-faint uppercase">{new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)}</span>
                  <span className="figures font-display text-xl font-semibold text-ink">{date.getDate()}</span>
                </p>
                <Avatar name={session.partner.name} url={session.partner.avatarUrl} size="xs" />
                <div className="min-w-0 flex-1">
                  <Link to={`/user/${session.partner.id}`} className="rounded font-semibold text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{session.partner.name}</Link>
                  {/* The time sits in its own right-hand column, so a narrow board column never strands a separator. */}
                  <p className="flex gap-3 text-sm text-muted">
                    <span className="min-w-0 flex-1">{session.isTeaching ? 'Teaching' : 'Learning'} {session.skillName}</span>
                    <span className="figures shrink-0 font-medium text-ink">{formatSlotTime(session.startsAt)}</span>
                    <span className="sr-only">, {date.toDateString()}</span>
                  </p>
                </div>
                {getJoinState(session, now) === 'open' && <JoinMeetingButton session={session} now={now} variant="secondary" partnerName={firstName} className="lg:min-h-9 lg:px-4" />}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
