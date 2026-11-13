import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { SessionToSettle } from '../../hooks/useDashboard'
import type { MatchRecommendation } from '../../types'
import AlertBanner from '../common/AlertBanner'
import EmptyState from '../common/EmptyState'
import Avatar from '../common/Avatar'
import { getButtonClasses, getToggleClasses } from '../common/buttonStyles'
import ConfirmAllButton from '../schedule/ConfirmAllButton'
import type { InboxItem } from './inboxItems'
import { InboxRowsSkeleton } from '../common/pageSkeletons'

interface InboxTableProps {
  status: AsyncStatus
  onRetry: () => void
  needs: InboxItem[]
  waiting: InboxItem[]
  confirmable: SessionToSettle[]
  onSettle: (item: SessionToSettle) => void
  onOpenRequest: (match: MatchRecommendation) => void
  onChanged: (message: string) => void
  // The first owed row gets the filled button, unless a session starting now already holds the page's one primary.
  primaryFirst: boolean
}

// The rest stay one tap away ("View all"), so the panel reads at a glance without hiding any request.
const VISIBLE = 3

// Things to act on, as people: tabs split what's owed from what waits on others, rows sit in urgency order,
// and each says in one sentence where it stands, with one action.
export default function InboxTable({ status, onRetry, needs, waiting, confirmable, onSettle, onOpenRequest, onChanged, primaryFirst }: InboxTableProps) {
  const [tab, setTab] = useState<'needs' | 'waiting'>(needs.length > 0 || waiting.length === 0 ? 'needs' : 'waiting')
  const [isExpanded, setIsExpanded] = useState(false)
  const rows = tab === 'needs' ? needs : waiting
  const shown = isExpanded ? rows : rows.slice(0, VISIBLE)
  const hidden = rows.length - shown.length

  function actionFor(item: InboxItem, index: number) {
    const { action } = item
    const variant = tab === 'needs' && index === 0 && primaryFirst ? 'primary' : 'secondary'
    const classes = getButtonClasses(variant, 'lg:min-h-9 lg:px-4')
    const who = item.name.split(' ')[0]
    if (action.kind === 'link') return <Link to={action.to} className={classes}>{action.label}<span className="sr-only"> of your session with {who}</span></Link>
    const onClick = action.kind === 'settle' ? () => onSettle(action.item) : () => onOpenRequest(action.match)
    return <button type="button" onClick={onClick} className={classes}>{action.label}<span className="sr-only"> for {who}</span></button>
  }

  const tabClasses = (isOn: boolean) => getToggleClasses(isOn)
  // Counts and rows wait for the first answer; a later refresh keeps the current ones on screen.
  const isFirstLoad = status === 'loading' && needs.length === 0 && waiting.length === 0

  return (
    <section aria-labelledby="inbox-heading" className="rounded-2xl bg-card">
      <h2 id="inbox-heading" className="sr-only">Your sessions and requests</h2>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex gap-1" role="group" aria-label="Show">
          <button type="button" aria-pressed={tab === 'needs'} onClick={() => { setTab('needs'); setIsExpanded(false) }} className={tabClasses(tab === 'needs')}>
            Your turn {!isFirstLoad && <span className="figures ml-1.5 opacity-70">{needs.length}</span>}
          </button>
          <button type="button" aria-pressed={tab === 'waiting'} onClick={() => { setTab('waiting'); setIsExpanded(false) }} className={tabClasses(tab === 'waiting')}>
            Their turn {!isFirstLoad && <span className="figures ml-1.5 opacity-70">{waiting.length}</span>}
          </button>
        </div>
        {tab === 'needs' && confirmable.length > 1 ? <ConfirmAllButton items={confirmable} onDone={onChanged} /> : null}
      </div>

      {isFirstLoad && <div role="status" aria-label="Loading sessions"><InboxRowsSkeleton /></div>}
      {status === 'error' && <div className="p-5"><AlertBanner tone="inset" message="We couldn't load your sessions." onRetry={onRetry} /></div>}
      {status === 'ready' && rows.length === 0 && (
        <div className="p-4 sm:p-5"><EmptyState icon="calendar" tone="inset" title={tab === 'needs' ? 'All done. Nothing for you to do' : 'No one owes you a reply'} /></div>
      )}
      {status !== 'error' && rows.length > 0 && (
        <ul>
          {shown.map((item, index) => (
            <li key={item.key} className="flex items-center gap-3 border-t border-line/70 px-4 py-3.5 first:border-t-0 sm:gap-4 sm:px-5">
              <Avatar name={item.name} url={item.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <Link to={`/user/${item.peerId}`} className="rounded font-semibold text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{item.name}</Link>
                <p className="text-sm text-pretty text-muted">{item.line}</p>
              </div>
              <div className="shrink-0">{actionFor(item, index)}</div>
            </li>
          ))}
        </ul>
      )}
      {status !== 'error' && rows.length > VISIBLE && (
        <div className="border-t border-line px-4 py-1 sm:px-5">
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="inline-flex min-h-11 items-center rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
            {isExpanded ? 'Show fewer' : <>View all requests <span className="figures ml-1 text-muted">· {hidden} more</span></>}
          </button>
        </div>
      )}
    </section>
  )
}
