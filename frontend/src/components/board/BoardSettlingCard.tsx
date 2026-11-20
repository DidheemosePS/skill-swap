import type { SessionDetail } from '../../types'
import Avatar from '../common/Avatar'
import SettlingActions from '../schedule/SettlingActions'
import type { SettleStep } from '../schedule/SettlingDrawer'
import { getSettlingLine } from '../schedule/settlingCopy'

interface BoardSettlingCardProps {
  sessions: SessionDetail[]
  myId: string
  now: number
  onOpen: (session: SessionDetail, step: SettleStep) => void
}

// Ended sessions in their 24-hour window, as one quiet white card under what needs the member: each states
// the outcome the meeting records show and when the credit moves. Nothing here is owed.
export default function BoardSettlingCard({ sessions, myId, now, onOpen }: BoardSettlingCardProps) {
  if (sessions.length === 0) return null
  return (
    <section aria-labelledby="settling-heading" className="rounded-2xl border border-line bg-surface p-5">
      <h2 id="settling-heading" className="font-display text-lg font-semibold">Settling <span className="figures font-medium text-muted">· {sessions.length}</span></h2>
      <ul className="mt-2">
        {sessions.map((session) => {
          const first = session.partner.name.split(' ')[0]
          return (
            <li key={session.id} className="flex gap-3 border-t border-line py-3 first:border-t-0">
              <Avatar name={session.partner.name} url={session.partner.avatarUrl} size="xs" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">{session.skillName} with {first}</p>
                <p className="text-pretty text-muted">{getSettlingLine(session, now)}</p>
                <div className="mt-1.5">
                  <SettlingActions iConfirmed={session.confirmedBy.includes(myId)} partnerFirstName={first} onOpen={(step) => onOpen(session, step)} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
