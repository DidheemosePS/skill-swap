import { useCallback, useState } from 'react'
import MemberBoard from '../components/cards/MemberBoard'
import AppNavbar from '../components/common/AppNavbar'
import Button from '../components/common/Button'
import ExploreFilterPanel from '../components/common/ExploreFilterPanel'
import ExploreToolbar from '../components/common/ExploreToolbar'
import Modal from '../components/common/Modal'
import { useAsyncData } from '../hooks/useAsyncData'
import { useExploreFilters } from '../hooks/useExploreFilters'
import { searchMembers } from '../services/memberService'
import { countFilters } from '../utils/exploreFilters'
import { MAX_SKILL_NAME_LENGTH } from '../utils/skills'

export default function ExplorePage() {
  const { filters, skillInput, setSkillInput, updateFilters, clearFilters, hasActiveFilters } = useExploreFilters()
  const { skill, type, rating, day, sort, reliable } = filters
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const filterCount = countFilters(filters)

  // Depends on the URL-backed values, so a new fetch starts only after the debounce settles.
  const fetchMembers = useCallback(
    () => searchMembers({ skill, type, rating, day, sort, reliable }),
    [skill, type, rating, day, sort, reliable],
  )
  const members = useAsyncData(fetchMembers)
  const panel = <ExploreFilterPanel filters={filters} onChange={updateFilters} hasActiveFilters={hasActiveFilters} onClear={clearFilters} />

  return (
    <>
      <title>Explore · Skill Swap</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-page px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-10">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Explore</h1>
        <p className="mt-1 text-sm text-muted">Find someone to swap with.</p>

        <div role="search" className="mt-5">
          <label htmlFor="explore-skill" className="sr-only">Search by skill</label>
          <div className="flex min-h-11 items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 transition-colors hover:border-muted focus-within:ring-2 focus-within:ring-accent">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="9" cy="9" r="6" />
              <path d="m14 14 4 4" />
            </svg>
            <input
              id="explore-skill"
              type="search"
              value={skillInput}
              maxLength={MAX_SKILL_NAME_LENGTH}
              autoComplete="off"
              placeholder="Search what you want to learn, like Python"
              onChange={(event) => setSkillInput(event.target.value)}
              className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
            />
            {/* Replaces the browser's own clear button, which ignores the palette. */}
            {skillInput !== '' && (
              <button
                type="button"
                onClick={() => setSkillInput('')}
                aria-label="Clear search"
                className="-mr-1.5 inline-flex size-11 shrink-0 items-center justify-center rounded text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sticks under the phone top bar, so changing the deal or filters never means scrolling back up. */}
        <div className="sticky top-16 z-10 -mx-4 mt-3 bg-shell px-4 py-2 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-4 lg:p-0">
          <ExploreToolbar filters={filters} onChange={updateFilters} filterCount={filterCount} panel={panel} onOpenSheet={() => setIsFilterSheetOpen(true)} />
        </div>

        <div className="mt-3 lg:mt-4">
          <MemberBoard
            members={members.data}
            status={members.status}
            onRetry={members.retry}
            filters={filters}
            onChange={updateFilters}
            onClearSearch={() => setSkillInput('')}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </main>

      {isFilterSheetOpen && (
        <Modal
          title="Filters"
          placement="drawer"
          onClose={() => setIsFilterSheetOpen(false)}
          // The count waits for the new results, so it never promises a number from the previous filters.
          footer={<Button onClick={() => setIsFilterSheetOpen(false)}>{members.status === 'loading' || !members.data ? 'Updating…' : `Show ${members.data.length} ${members.data.length === 1 ? 'member' : 'members'}`}</Button>}
        >
          <div className="mt-2">{panel}</div>
        </Modal>
      )}
    </>
  )
}
