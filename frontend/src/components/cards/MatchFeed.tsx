import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import type { MatchRecommendation, SwapType } from '../../types'
import AlertBanner from '../common/AlertBanner'
import { getButtonClasses } from '../common/buttonStyles'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import Tabs from '../common/Tabs'
import MatchCard from './MatchCard'

interface MatchFeedProps {
  matches: MatchRecommendation[]
  status: AsyncStatus
  onRetry: () => void
  onRequest: (match: MatchRecommendation) => void
}

const TABS: { id: SwapType; label: React.ReactNode }[] = [
  { id: 'two_way', label: <><span aria-hidden="true">🔥 </span>Direct 2-Way Matches</> },
  { id: 'one_way', label: <><span aria-hidden="true">⚡ </span>1-Way Credit Matches</> },
]

const EMPTY_COPY: Record<SwapType, { title: string; description: string }> = {
  two_way: { title: 'No direct matches yet', description: 'We will list members here when they want to learn what you teach, and teach what you want to learn.' },
  one_way: { title: 'No credit matches yet', description: 'We will list members here when they teach a skill on your learn list.' },
}

export default function MatchFeed({ matches, status, onRetry, onRequest }: MatchFeedProps) {
  const [activeTab, setActiveTab] = useState<SwapType>('two_way')
  const visible = matches.filter((match) => match.swapType === activeTab)

  return (
    <Tabs label="Match type" tabs={TABS} active={activeTab} onChange={setActiveTab}>
      {status === 'loading' && (
        <div role="status" aria-label="Loading matches" className="space-y-4">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>
      )}
      {status === 'error' && <AlertBanner message="We couldn't load your matches." onRetry={onRetry} />}
      {status === 'ready' && visible.length === 0 && (
        <EmptyState
          {...EMPTY_COPY[activeTab]}
          action={<Link to="/explore" className={getButtonClasses('secondary')}>Explore all members</Link>}
        />
      )}
      {status === 'ready' && visible.length > 0 && (
        <ul className="space-y-4">
          {visible.map((match) => (
            <li key={match.id}>
              <MatchCard match={match} onRequest={onRequest} />
            </li>
          ))}
        </ul>
      )}
    </Tabs>
  )
}
