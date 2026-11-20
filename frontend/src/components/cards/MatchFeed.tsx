import { useState } from 'react'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { MatchRecommendation } from '../../types'
import { isInProgress } from '../../utils/matches'
import AlertBanner from '../common/AlertBanner'
import { getToggleClasses } from '../common/buttonStyles'
import MatchCard from './MatchCard'
import MatchFeedEmpty from './MatchFeedEmpty'
import { PersonGridSkeleton } from '../common/skeletons'

interface MatchFeedProps {
  matches: MatchRecommendation[]
  status: AsyncStatus
  onRetry: () => void
  onRequest: (match: MatchRecommendation) => void
  // When a session is starting soon its Join is the page's one primary, so no card takes it.
  hasImminent: boolean
}

type Kind = 'free' | 'credit'

// New people only (started ones live in the inbox), one kind at a time: free swaps by default, credit matches
// one toggle away. The difference between the two is explained in the heading's tip, not in a paragraph.
export default function MatchFeed({ matches, status, onRetry, onRequest, hasImminent }: MatchFeedProps) {
  const fresh = matches.filter((match) => !isInProgress(match))
  const freeSwaps = fresh.filter((match) => match.swapType === 'two_way')
  const creditMatches = fresh.filter((match) => match.swapType === 'one_way')
  // Opens on whichever kind has people in it, free swaps first.
  const [picked, setPicked] = useState<Kind | null>(null)
  const kind: Kind = picked ?? (freeSwaps.length > 0 || creditMatches.length === 0 ? 'free' : 'credit')
  const shown = kind === 'free' ? freeSwaps : creditMatches
  // The feed arrives sorted by score, so the first free swap is the best place to start.
  const topId = freeSwaps[0]?.id ?? null
  // Counts and cards wait for the first answer, so the toggles never claim 0 while loading.
  const isFirstLoad = status === 'loading' && matches.length === 0

  const toggle = (value: Kind, label: string, count: number) => (
    <button
      type="button"
      aria-pressed={kind === value}
      onClick={() => setPicked(value)}
      className={getToggleClasses(kind === value)}
    >
      {label} {!isFirstLoad && <span className="figures ml-1.5 opacity-70">{count}</span>}
    </button>
  )

  return (
    <section aria-labelledby="recommended-heading">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="recommended-heading" className="flex items-center gap-0.5 font-display text-lg font-semibold text-ink">
          People to swap with
        </h2>
        <div className="flex gap-1" role="group" aria-label="Show">
          {toggle('free', 'Free swaps', freeSwaps.length)}
          {toggle('credit', 'With a credit', creditMatches.length)}
        </div>
      </div>

      {isFirstLoad && <div role="status" aria-label="Loading matches" className="mt-4"><PersonGridSkeleton count={3} className="md:grid-cols-2 xl:grid-cols-3" /></div>}
      {status === 'error' && <div className="mt-4"><AlertBanner message="We couldn't load your matches." onRetry={onRetry} /></div>}
      {status !== 'error' && shown.length > 0 && (
        <ul className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((match) => (
            <li key={match.id} className={shown.length === 1 ? 'md:col-span-2 xl:col-span-3' : ''}>
              <MatchCard match={match} onRequest={onRequest} isPrimary={!hasImminent && match.id === topId} wide={shown.length === 1} />
            </li>
          ))}
        </ul>
      )}
      {/* An empty kind is one compact card, centred under the heading, with the partner's seat left open. */}
      {status === 'ready' && shown.length === 0 && <MatchFeedEmpty kind={kind} />}
    </section>
  )
}
