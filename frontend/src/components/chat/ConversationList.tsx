import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import { useNow } from '../../hooks/useNow'
import type { ConversationSummary } from '../../types'
import { formatRelativeTime } from '../../utils/relativeTime'
import AlertBanner from '../common/AlertBanner'
import Avatar from '../common/Avatar'
import { getButtonClasses } from '../common/buttonStyles'
import EmptyState from '../common/EmptyState'
import { getConversationGroup, getMatchReason } from './conversationGroups'
import type { ConversationGroup } from './conversationGroups'
import { ConversationRowsSkeleton } from '../common/pageSkeletons'

interface ConversationListProps {
  conversations: ConversationSummary[] | null
  status: AsyncStatus
  onRetry: () => void
  selectedId: string | null
  // True when search or the Your turn filter hid everything, so the empty state says so.
  isFiltered: boolean
  onClearFilter: () => void
  // The search text, so a row matched by a skill can say which one.
  query: string
}

const ORDER: ConversationGroup[] = ['needs', 'booked', 'waiting', 'other']

// The people you talk with: face, name, last message, time and an unread dot. Deals and session state live in
// the open thread, where they can be acted on.
export default function ConversationList({ conversations, status, onRetry, selectedId, isFiltered, onClearFilter, query }: ConversationListProps) {
  // Ticks so a session that ends while the page is open leaves "Booked" on its own.
  const now = useNow(60_000)

  // The list quietly refetches on every message, so the skeleton only shows on the first load.
  if (conversations === null) {
    if (status === 'error') return <div className="p-4"><AlertBanner message="We couldn't load your conversations." onRetry={onRetry} /></div>
    return (
      <div role="status" aria-label="Loading conversations"><ConversationRowsSkeleton /></div>
    )
  }
  if (conversations.length === 0 && isFiltered) {
    return (
      <div className="p-4">
        <EmptyState
          icon="search"
          title="No conversations match"
          description="Try another name or skill, or show all conversations."
          action={<button type="button" onClick={onClearFilter} className={getButtonClasses('secondary')}>Show all</button>}
        />
      </div>
    )
  }
  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon="chat"
          title="No conversations yet"
          description="Request a session with a member to start chatting."
          action={<Link to="/explore" className={getButtonClasses('secondary')}>Explore members</Link>}
        />
      </div>
    )
  }

  // Still ordered by who acts next (owed replies first), but shown as one list of people: the order does the
  // grouping, so no headings or tags crowd the rows.
  const ordered = ORDER.flatMap((group) => conversations.filter((item) => getConversationGroup(item, now) === group))

  // Arrow keys move between conversations, like a mail list.
  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>('a[data-conversation]')]
    const index = links.indexOf(document.activeElement as HTMLAnchorElement)
    if (index === -1) return
    event.preventDefault()
    links[Math.min(Math.max(index + (event.key === 'ArrowDown' ? 1 : -1), 0), links.length - 1)]?.focus()
  }

  return (
    <ul aria-label="Conversations" onKeyDown={handleKeyDown} className="space-y-0.5 px-2 pb-3">
      {ordered.map((item) => {
        const { id, peer, unreadCount, lastMessagePreview, lastMessageAt } = item
        const matchReason = getMatchReason(item, query)
        const isUnread = unreadCount > 0
        return (
          <li key={id}>
            <Link
              data-conversation
              to={`/messages?c=${id}`}
              aria-current={id === selectedId ? 'true' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent ${id === selectedId ? 'bg-next-soft' : ''}`}
            >
              <Avatar name={peer.name} url={peer.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate ${isUnread ? 'font-bold' : 'font-semibold'}`}>{peer.name}</span>
                  <span className="shrink-0 text-xs text-faint">{formatRelativeTime(lastMessageAt, now)}</span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${isUnread ? 'font-medium text-ink' : 'text-muted'}`}>
                    {matchReason ? <mark className="rounded-sm bg-accent-soft px-1 text-accent-strong">{matchReason}</mark> : lastMessagePreview}
                  </span>
                  {isUnread && <span className="size-2 shrink-0 rounded-full bg-ink"><span className="sr-only">{unreadCount} unread</span></span>}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
