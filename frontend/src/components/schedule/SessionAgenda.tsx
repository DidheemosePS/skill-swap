import type { AgendaItem } from '../../hooks/useSessionsPage'
import AgendaLine from './AgendaLine'
import type { AgendaActions } from './AgendaLine'

interface SessionAgendaProps extends AgendaActions {
  items: AgendaItem[]
  now: number
  // The session starting now, which gets the page's one primary (Join) on its own card.
  imminentId: string | null
}

const DAY_MS = 86_400_000
const dayKey = (iso: string) => new Date(iso).toDateString()

function dayName(iso: string, now: number) {
  if (dayKey(iso) === dayKey(new Date(now).toISOString())) return 'Today'
  if (dayKey(iso) === dayKey(new Date(now + DAY_MS).toISOString())) return 'Tmrw'
  // The month joins the weekday only once the agenda reaches another month, so day numbers stay unambiguous.
  const sameMonth = new Date(iso).getMonth() === new Date(now).getMonth()
  return new Intl.DateTimeFormat(undefined, sameMonth ? { weekday: 'short' } : { weekday: 'short', month: 'short' }).format(new Date(iso))
}

// Coming up as a stack of session cards in time order, each with its own date block, so the week reads at a glance.
export default function SessionAgenda({ items, now, imminentId, ...actions }: SessionAgendaProps) {
  return (
    <ol className="grid gap-3">
      {items.map((item) => (
        <AgendaLine
          key={item.kind === 'booked' ? item.session.id : item.request.requestId}
          item={item}
          dayLabel={dayName(item.at, now)}
          now={now}
          isImminent={item.kind === 'booked' && item.session.id === imminentId}
          {...actions}
        />
      ))}
    </ol>
  )
}
