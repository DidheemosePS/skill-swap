import { useState } from 'react'
import MatchFeed from '../components/cards/MatchFeed'
import AppNavbar from '../components/common/AppNavbar'
import SwapRequestModal from '../components/schedule/SwapRequestModal'
import UpcomingSessionsWidget from '../components/schedule/UpcomingSessionsWidget'
import CreditSummaryCard from '../components/wallet/CreditSummaryCard'
import { useAsyncData } from '../hooks/useAsyncData'
import { useWallet } from '../hooks/useWallet'
import { fetchMatches } from '../services/matchService'
import { fetchUpcomingSessions } from '../services/sessionService'
import type { MatchRecommendation } from '../types'

export default function DashboardPage() {
  const matches = useAsyncData(fetchMatches)
  const sessions = useAsyncData(fetchUpcomingSessions)
  const wallet = useWallet()
  const [requestMatch, setRequestMatch] = useState<MatchRecommendation | null>(null)

  return (
    <>
      <title>Dashboard · Skill Swap</title>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Your matches</h1>

        {/* DOM order puts sessions first on small screens, where a join link is the most urgent item.
            From lg up, the grid places the feed in the 70% column across both sidebar rows. */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[7fr_3fr] lg:grid-rows-[auto_1fr] lg:items-start">
          <div className="lg:col-start-2 lg:row-start-1">
            <UpcomingSessionsWidget sessions={sessions.data ?? []} status={sessions.status} onRetry={sessions.retry} />
          </div>
          <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <MatchFeed
              matches={matches.data ?? []}
              status={matches.status}
              onRetry={matches.retry}
              onRequest={setRequestMatch}
            />
          </div>
          <div className="lg:col-start-2 lg:row-start-2">
            <CreditSummaryCard wallet={wallet.wallet} status={wallet.status} onRetry={wallet.refresh} />
          </div>
        </div>
      </main>

      {requestMatch && (
        <SwapRequestModal
          key={requestMatch.id}
          offer={requestMatch}
          credits={wallet.status === 'ready' ? (wallet.wallet?.credits ?? null) : null}
          onClose={() => setRequestMatch(null)}
        />
      )}
    </>
  )
}
