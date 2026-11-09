import { useState } from 'react'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { DirectoryMember } from '../../types'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import MentorCard from './MentorCard'

interface MemberDirectoryProps {
  members: DirectoryMember[] | null
  status: AsyncStatus
  onRetry: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

const GRID_CLASSES = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f']

export default function MemberDirectory({ members, status, onRetry, hasActiveFilters, onClearFilters }: MemberDirectoryProps) {
  const [now] = useState(() => Date.now())

  if (status === 'error') return <AlertBanner message="We couldn't load the directory." onRetry={onRetry} />

  // Skeletons only show on the first load. Later searches dim the current results instead,
  // so the grid doesn't blank out and jump on every change.
  if (members === null) {
    return (
      <div role="status" aria-label="Loading members" className={GRID_CLASSES}>
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-80 rounded-xl" />
        ))}
      </div>
    )
  }

  const isRefreshing = status === 'loading'
  const countLabel = members.length === 1 ? '1 member' : `${members.length} members`

  return (
    <div aria-busy={isRefreshing} className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
      {/* A fixed height keeps the grid still when the Clear filters link appears. */}
      <div className="mb-3 flex h-8 items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted">
          {isRefreshing ? 'Searching…' : countLabel}
        </p>
        {hasActiveFilters && members.length > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="min-h-8 rounded px-1 text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear filters
          </button>
        )}
      </div>
      {members.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No members match your search' : 'No members yet'}
          description={hasActiveFilters ? 'Try another skill or remove a filter.' : 'New members will appear here as they join.'}
          action={hasActiveFilters && <Button variant="secondary" onClick={onClearFilters}>Clear filters</Button>}
        />
      ) : (
        <ul className={GRID_CLASSES}>
          {members.map((member) => (
            <li key={member.user.id}>
              <MentorCard member={member} now={now} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
