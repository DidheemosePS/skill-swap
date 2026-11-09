import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ExploreFilters } from '../types'
import { DEFAULT_FILTERS, parseExploreFilters, serializeExploreFilters } from '../utils/exploreFilters'
import { cleanSkillName } from '../utils/skills'
import { useDebounce } from './useDebounce'

const SEARCH_DEBOUNCE_MS = 300

// The URL is the source of truth, so filtered views can be shared. Only the search box keeps local
// state, because it must update on every keystroke while the URL and fetch wait for a pause.
export function useExploreFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseExploreFilters(searchParams)
  const [skillInput, setSkillInput] = useState(filters.skill)
  const [syncedSkill, setSyncedSkill] = useState(filters.skill)
  const debouncedInput = useDebounce(skillInput, SEARCH_DEBOUNCE_MS)

  // Replace rather than push, so Back leaves Explore instead of undoing one keystroke at a time.
  function updateFilters(changes: Partial<ExploreFilters>) {
    setSearchParams((current) => serializeExploreFilters({ ...parseExploreFilters(current), ...changes }), {
      replace: true,
    })
  }

  // The URL changed from outside, such as Back or the Explore nav link: show that in the box.
  if (filters.skill !== syncedSkill) {
    setSyncedSkill(filters.skill)
    setSkillInput(filters.skill)
  }

  // Runs only when the debounced text changes, so changing a dropdown can't rewrite the search.
  useEffect(() => {
    const skill = cleanSkillName(debouncedInput)
    if (skill === filters.skill) return
    // Marked as synced first, so this write can't overwrite anything typed since the pause.
    setSyncedSkill(skill)
    updateFilters({ skill })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput])

  function clearFilters() {
    setSkillInput('')
    setSearchParams(serializeExploreFilters(DEFAULT_FILTERS), { replace: true })
  }

  const hasActiveFilters =
    skillInput.trim() !== '' || serializeExploreFilters({ ...filters, sort: DEFAULT_FILTERS.sort }).size > 0

  return { filters, skillInput, setSkillInput, updateFilters, clearFilters, hasActiveFilters }
}
