import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { ConversationSummary } from '../../types'
import { formatRelativeTime } from '../../utils/relativeTime'
import AlertBanner from '../common/AlertBanner'
import Avatar from '../common/Avatar'
import { getButtonClasses } from '../common/buttonStyles'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'

interface ConversationListProps {
  conversations: ConversationSummary[] | null
  status: AsyncStatus
  onRetry: () => void
  selectedId: string | null
}

export default function ConversationList({ conversations, status, onRetry, selectedId }: ConversationListProps) {
  const [now] = useState(() => Date.now())

  // The list quietly refetches on every message, so the skeleton only shows on the first load.
  if (conversations === null) {
    if (status === 'error') return <div className="p-4"><AlertBanner message="We couldn't load your conversations." onRetry={onRetry} /></div>
    return (
      <div role="status" aria-label="Loading conversations" className="space-y-3 p-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    )
  }
  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="No conversations yet"
          description="Request a swap with a member to start chatting."
          action={<Link to="/explore" className={getButtonClasses('secondary')}>Explore members</Link>}
        />
      </div>
    )
  }

  return (
    <ul className="divide-y divide-line">
      {conversations.map(({ id, peer, unreadCount, lastMessagePreview, lastMessageAt }) => (
        <li key={id}>
          <Link
            to={`/messages?c=${id}`}
            aria-current={id === selectedId ? 'true' : undefined}
            className={`flex items-center gap-3 p-4 outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${id === selectedId ? 'bg-accent-soft' : ''}`}
          >
            <Avatar name={peer.name} url={peer.avatarUrl} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className={`truncate text-sm ${unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>{peer.name}</span>
                <span className="shrink-0 text-xs text-muted">{formatRelativeTime(lastMessageAt, now)}</span>
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2">
                <span className={`truncate text-sm ${unreadCount > 0 ? 'text-ink' : 'text-muted'}`}>{lastMessagePreview}</span>
                {unreadCount > 0 && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                    {unreadCount}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
