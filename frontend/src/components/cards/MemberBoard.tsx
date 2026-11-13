import { useId, useState } from 'react'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import { useWallet } from '../../hooks/useWallet'
import type { DirectoryMember, ExploreDeal, ExploreFilters, ExploreSort } from '../../types'
import { SORT_OPTIONS } from '../../utils/exploreFilters'
import ActiveFilters from '../common/ActiveFilters'
import AlertBanner from '../common/AlertBanner'
import SwapRequestModal from '../schedule/SwapRequestModal'
import MemberBoardEmpty from './MemberBoardEmpty'
import MemberGrid from './MemberGrid'
import { ExploreResultsSkeleton } from '../common/pageSkeletons'

interface MemberBoardProps {
  members: DirectoryMember[] | null
  status: AsyncStatus
  onRetry: () => void
  filters: ExploreFilters
  onChange: (changes: Partial<ExploreFilters>) => void
  onClearSearch: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

// Free swaps first (they cost nothing), then people to learn from with a credit; each group says its deal once.
const SECTIONS: { deal: ExploreDeal; title: string }[] = [
  { deal: 'free', title: 'Swap with' },
  { deal: 'credit', title: 'Learn from' },
]

// Two rows of two (or one and a bit of three) per section before "See all".
const PREVIEW = 4

export default function MemberBoard({ members, status, onRetry, filters, onChange, onClearSearch, hasActiveFilters, onClearFilters }: MemberBoardProps) {
  const sortId = useId()
  const wallet = useWallet()
  // Booking happens here, over the board, so finding someone and asking for a time is one step.
  const [booking, setBooking] = useState<DirectoryMember | null>(null)
  const credits = wallet.status === 'ready' ? (wallet.wallet?.credits ?? null) : null

  if (status === 'error') return <AlertBanner message="We couldn't load the directory." onRetry={onRetry} />

  // Skeletons only on the first load. Later searches dim the current results instead,
  // so the board doesn't blank out and jump on every change.
  if (members === null) {
    return (
      <div role="status" aria-label="Loading members"><ExploreResultsSkeleton /></div>
    )
  }

  const isRefreshing = status === 'loading'
  const search = filters.skill
  // Recommended groups by deal; any other sort is a ranking across everyone, so it gets one list
  // where each row's stub still carries its cost.
  const isRanked = filters.sort !== 'recommended'
  // Each group's deal in one line under its heading. The credit one adds the balance, since it's the
  // one place on Explore a credit is about to be spent.
  const notes: Record<ExploreDeal, string> = {
    free: 'They want something you teach.',
    credit: `One credit an hour.${credits !== null ? ` ${credits} ${credits === 1 ? 'credit' : 'credits'} in your wallet.` : ''}`,
  }
  const grouped = SECTIONS.map((section) => ({ ...section, rows: members.filter((member) => member.deal === section.deal) }))

  // With both deals showing, each section previews a few people and links to its own full list, so a long run of
  // free swaps never buries the credit section below it.
  const isPreview = filters.type === 'all'
  const filtersKey = JSON.stringify(filters)
  const rankLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label.toLowerCase()

  return (
    <section id="results" tabIndex={-1} aria-label="Members" aria-busy={isRefreshing} className={`outline-none transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p role="status" className="text-sm text-muted">
          {isRefreshing ? 'Searching…' : <><span className="figures font-medium text-ink">{members.length}</span> {members.length === 1 ? 'person' : 'people'}</>}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={sortId} className="text-muted">Sort</label>
          <select
            id={sortId}
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as ExploreSort })}
            className="min-h-11 rounded-lg border border-line bg-surface px-2 font-medium outline-none hover:border-muted focus-visible:ring-2 focus-visible:ring-accent lg:min-h-9"
          >
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>
      <ActiveFilters filters={filters} onChange={onChange} onClearSearch={onClearSearch} />

      {members.length === 0 ? (
        <div className="mt-6">
          <MemberBoardEmpty filters={filters} onChange={onChange} hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
        </div>
      ) : isRanked ? (
        <MemberGrid key={filtersKey} label={`People by ${rankLabel}`} members={members} search={search} onBook={setBooking} />
      ) : (
        grouped.filter((section) => section.rows.length > 0).map((section) => (
          <section key={section.deal} aria-labelledby={`deal-${section.deal}`} className="mt-8 first-of-type:mt-6">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <div>
                <h2 id={`deal-${section.deal}`} className="text-xl font-semibold text-ink">{section.title} <span className="figures font-sans text-base font-normal text-muted">{section.rows.length}</span></h2>
                <p className="text-sm text-muted">{notes[section.deal]}</p>
              </div>
              {isPreview && section.rows.length > PREVIEW && (
                <button
                  type="button"
                  onClick={() => {
                    onChange({ type: section.deal === 'free' ? '2way' : '1way' })
                    // Back to the top of the results, where the full list now starts.
                    document.getElementById('results')?.scrollIntoView({ block: 'start' })
                  }}
                  className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent lg:min-h-9"
                >
                  See all <span className="figures">{section.rows.length}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
                </button>
              )}
            </div>
            <MemberGrid key={filtersKey} members={isPreview ? section.rows.slice(0, PREVIEW) : section.rows} search={search} onBook={setBooking} />
          </section>
        ))
      )}
      {booking && (
        <SwapRequestModal
          key={booking.user.id}
          offer={{ peer: booking.user, swapType: booking.swapType, teachesYou: booking.teachesYou, learnsFromYou: booking.learnsFromYou, creditCost: booking.swapType === 'two_way' ? 0 : 1 }}
          credits={credits}
          existingSessionAt={booking.nextSessionAt}
          onClose={() => setBooking(null)}
        />
      )}
    </section>
  )
}
