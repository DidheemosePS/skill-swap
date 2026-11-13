import type { InboxFilter } from './conversationGroups'
import { getToggleClasses } from '../common/buttonStyles'

interface ConversationSearchProps {
  query: string
  onQuery: (query: string) => void
  filter: InboxFilter
  onFilter: (filter: InboxFilter) => void
  needsCount: number
  // Unread messages, the same number the navbar badge shows, so the two can be matched at a glance.
  unreadCount: number
}

const chip = (isOn: boolean) => getToggleClasses(isOn)

// Finding a thread by person, skill or message, and narrowing the list. Each count sits on the chip that
// shows those conversations, so a number is never stated apart from the names behind it.
export default function ConversationSearch({ query, onQuery, filter, onFilter, needsCount, unreadCount }: ConversationSearchProps) {
  const chips: { value: InboxFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: 0 },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'needs', label: 'Your turn', count: needsCount },
  ]
  return (
    <div role="search" className="space-y-2.5 px-4 pt-1 pb-3">
      <label className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 hover:border-muted focus-within:ring-2 focus-within:ring-accent">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 4 4" />
        </svg>
        <span className="sr-only">Search conversations</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search people, skills or messages"
          className="min-h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
        />
      </label>
      <div role="group" aria-label="Show" className="flex gap-1">
        {chips.map(({ value, label, count }) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => onFilter(value)} className={chip(filter === value)}>
            {label}
            {count > 0 && <span className="figures ml-1.5 opacity-70">{count}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
