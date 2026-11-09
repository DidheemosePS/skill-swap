import { useCallback } from 'react'
import MemberDirectory from '../components/cards/MemberDirectory'
import AppNavbar from '../components/common/AppNavbar'
import ExploreControls from '../components/common/ExploreControls'
import { useAsyncData } from '../hooks/useAsyncData'
import { useExploreFilters } from '../hooks/useExploreFilters'
import { searchMembers } from '../services/memberService'

export default function ExplorePage() {
  const { filters, skillInput, setSkillInput, updateFilters, clearFilters, hasActiveFilters } = useExploreFilters()
  const { skill, type, rating, day, sort } = filters

  // Depends on the URL-backed values, so a new fetch starts only after the debounce settles.
  const fetchMembers = useCallback(
    () => searchMembers({ skill, type, rating, day, sort }),
    [skill, type, rating, day, sort],
  )
  const members = useAsyncData(fetchMembers)

  return (
    <>
      <title>Explore · Skill Swap</title>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Explore members</h1>
        <div className="mt-6">
          <ExploreControls filters={filters} skillInput={skillInput} onSkillInput={setSkillInput} onChange={updateFilters} />
        </div>
        <div className="mt-6">
          <MemberDirectory
            members={members.data}
            status={members.status}
            onRetry={members.retry}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>
      </main>
    </>
  )
}
