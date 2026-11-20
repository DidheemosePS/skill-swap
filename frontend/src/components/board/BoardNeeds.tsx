import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { MatchRecommendation } from '../../types'
import AlertBanner from '../common/AlertBanner'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import type { InboxItem } from '../dashboard/inboxItems'
import BoardNeedCard from './BoardNeedCard'
import BoardRequestCard from './BoardRequestCard'

interface BoardNeedsProps {
  status: AsyncStatus
  onRetry: () => void
  needs: InboxItem[]
  onOpenRequest: (match: MatchRecommendation) => void
  onChanged: (message: string) => void
  // The first card gets the filled button, unless a session starting now already holds the page's one primary.
  primaryFirst: boolean
}

// Every reply owed, as coral index cards in urgency order, stacked in the board's middle column.
export default function BoardNeeds({ status, onRetry, needs, onOpenRequest, onChanged, primaryFirst }: BoardNeedsProps) {
  if (status === 'loading' && needs.length === 0) {
    return (
      <div role="status" aria-label="Loading sessions" className="rounded-2xl bg-coral-soft p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-6 h-11 w-32" />
      </div>
    )
  }
  if (status === 'error') {
    return <div><AlertBanner message="We couldn't load your sessions." onRetry={onRetry} /></div>
  }
  if (needs.length === 0) {
    return <div><EmptyState icon="calendar" title="Nothing needs you right now" /></div>
  }

  // Requests that carry tear-off times lead the column, so the board's signature card sits in the first view;
  // the rest keep their urgency order behind it.
  const hasTabs = (item: InboxItem) => item.action.kind === 'request' && !!item.action.match.pendingRequest?.awaitingMe && item.action.match.pendingRequest.proposedSlots.length > 0
  const ordered = [...needs.filter(hasTabs), ...needs.filter((item) => !hasTabs(item))]

  return (
    <>
      {ordered.map((item, index) => {
        const isPrimary = primaryFirst && index === 0
        const { action } = item
        if (action.kind === 'request' && action.match.pendingRequest?.awaitingMe && action.match.pendingRequest.proposedSlots.length > 0) {
          return <BoardRequestCard key={item.key} match={action.match} line={item.line} isPrimary={isPrimary} onOpen={onOpenRequest} onDone={onChanged} />
        }
        const onAct = action.kind === 'request' ? () => onOpenRequest(action.match) : () => undefined
        return <BoardNeedCard key={item.key} item={item} isPrimary={isPrimary} onAct={onAct} />
      })}
    </>
  )
}
