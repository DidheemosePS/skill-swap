import { useEffect, useState } from 'react'
import { searchMembers } from '../services/memberService'
import type { ExploreFilters } from '../types'
import { DEFAULT_FILTERS } from '../utils/exploreFilters'

export interface NearMiss {
  key: 'type' | 'day' | 'rating' | 'reliable'
  count: number
}

const KEYS: NearMiss['key'][] = ['type', 'day', 'rating', 'reliable']

// When filters rule everyone out, finds which single filter is to blame: how many members each one
// would let back in if it were removed. Runs only for an empty result, so normal browsing costs nothing.
// Null while it's still counting, so the empty state can say so instead of showing nothing.
export function useNearMisses(filters: ExploreFilters, isEmpty: boolean): NearMiss[] | null {
  const [result, setResult] = useState<{ signature: string; misses: NearMiss[] } | null>(null)
  const active = KEYS.filter((key) => filters[key] !== DEFAULT_FILTERS[key])
  const signature = isEmpty ? JSON.stringify(filters) : ''

  useEffect(() => {
    if (!signature) return
    let isCurrent = true
    Promise.all(active.map(async (key) => ({ key, count: (await searchMembers({ ...filters, [key]: DEFAULT_FILTERS[key] })).length })))
      .then((results) => {
        if (isCurrent) setResult({ signature, misses: results.filter((miss) => miss.count > 0).sort((a, b) => b.count - a.count) })
      })
      .catch(() => {
        if (isCurrent) setResult({ signature, misses: [] })
      })
    return () => {
      isCurrent = false
    }
    // The signature stands in for the filters, so a new object with the same values doesn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  if (!signature) return []
  return result?.signature === signature ? result.misses : null
}
