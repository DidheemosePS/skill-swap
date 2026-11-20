import { Link } from 'react-router-dom'
import type { MatchRecommendation } from '../../types'
import Avatar from '../common/Avatar'
import type { InboxItem } from '../dashboard/inboxItems'

interface BoardWaitingCardProps {
  items: InboxItem[]
  onOpenRequest: (match: MatchRecommendation) => void
  className?: string
  // The page renders this card in two places (one per layout, only one ever displayed), so each copy needs its own id.
  headingId?: string
}

// What waits on other people, as one quiet white card: nothing to do, but each stays one tap away.
export default function BoardWaitingCard({ items, onOpenRequest, className = '', headingId = 'waiting-heading' }: BoardWaitingCardProps) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby={headingId} className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      <h2 id={headingId} className="font-display text-lg font-semibold">Their turn <span className="figures font-medium text-muted">· {items.length}</span></h2>
      <ul className="mt-2">
        {items.map((item) => {
          const { action } = item
          const label = `${action.label}`
          return (
            <li key={item.key} className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0">
              <Avatar name={item.name} url={item.avatarUrl} size="xs" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">{item.name}</p>
                <p className="text-pretty text-muted">{item.line}</p>
              </div>
              {action.kind === 'link' ? (
                <Link to={action.to} className="shrink-0 rounded text-sm font-semibold text-accent underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-accent">{label}</Link>
              ) : action.kind === 'request' ? (
                <button type="button" onClick={() => onOpenRequest(action.match)} className="shrink-0 rounded text-sm font-semibold text-accent underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-accent">{label}</button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
