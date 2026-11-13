import { useState } from 'react'
import MatchFeed from '../components/cards/MatchFeed'
import AppNavbar from '../components/common/AppNavbar'
import DashboardHeader from '../components/common/DashboardHeader'
import ComingUpPanel from '../components/dashboard/ComingUpPanel'
import InboxTable from '../components/dashboard/InboxTable'
import { needsYouItems, waitingItems } from '../components/dashboard/inboxItems'
import RequestDialog from '../components/schedule/RequestDialog'
import SettleSessionDialogs from '../components/schedule/SettleSessionDialogs'
import StartingSoonStrip from '../components/schedule/StartingSoonStrip'
import SwapRequestModal from '../components/schedule/SwapRequestModal'
import CreditSummaryCard from '../components/wallet/CreditSummaryCard'
import { useCurrentUser } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'
import type { SessionToSettle } from '../hooks/useDashboard'
import { useWallet } from '../hooks/useWallet'
import type { MatchRecommendation } from '../types'
import WelcomeTour from '../components/common/WelcomeTour'
import { useWelcomeTour } from '../hooks/useWelcomeTour'
import { useToast } from '../hooks/useToast'

export default function DashboardPage() {
  const user = useCurrentUser()
  const dashboard = useDashboard()
  const { matches, sessions, imminent } = dashboard
  const wallet = useWallet()
  const [requestMatch, setRequestMatch] = useState<MatchRecommendation | null>(null)
  const tour = useWelcomeTour()
  const [settling, setSettling] = useState<SessionToSettle | null>(null)
  // The pending request open in its dialog, to answer, decline or withdraw.
  const [openRequest, setOpenRequest] = useState<MatchRecommendation | null>(null)
  // Rows move or vanish when an action changes them, so a toast says what happened.
  const toast = useToast()

  // Settling, accepting, declining or withdrawing moves sessions, matches and credits, so all three reload.
  function refreshAll(message: string) {
    toast.success(message)
    sessions.retry()
    matches.retry()
    wallet.refresh()
  }

  function afterSettle(message: string) {
    setSettling(null)
    refreshAll(message)
  }

  const needs = needsYouItems(dashboard.toSettle, dashboard.incoming)
  const waiting = waitingItems(dashboard.waitingSessions, dashboard.outgoing)
  const isReady = sessions.status === 'ready' && matches.status === 'ready'

  return (
    <>
      <title>Dashboard · Skill Swap</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-page px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-10">
        <DashboardHeader firstName={user.name.split(' ')[0]} needsCount={isReady ? needs.length : null} />

        {/* From xl, two columns on one 12-column grid: the work (now, then the inbox) beside the schedule and
            balance. Narrower screens stack them in that order, so what needs doing comes before what's booked;
            between lg and xl the schedule and balance sit side by side under the inbox. */}
        <div className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="min-w-0 space-y-6 xl:col-span-8">
            {imminent && <StartingSoonStrip session={imminent} />}
            <InboxTable
              status={sessions.status}
              onRetry={sessions.retry}
              needs={needs}
              waiting={waiting}
              confirmable={dashboard.toSettle.filter((item) => item.mode === 'confirm')}
              onSettle={setSettling}
              onOpenRequest={setOpenRequest}
              onChanged={refreshAll}
              primaryFirst={imminent === null}
            />
          </div>
          <aside aria-label="Schedule and wallet" className="grid min-w-0 content-start items-start gap-6 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
            <CreditSummaryCard wallet={wallet.wallet} status={wallet.status} onRetry={wallet.refresh} />
            <ComingUpPanel status={sessions.status} upcoming={dashboard.upcoming} imminentId={imminent?.id ?? null} />
          </aside>
          <div className="min-w-0 pt-4 xl:col-span-12">
            <MatchFeed
              matches={dashboard.feedMatches}
              status={matches.status}
              onRetry={matches.retry}
              onRequest={setRequestMatch}
              hasImminent={imminent !== null}
            />
          </div>
        </div>
      </main>

      {tour.isOpen && <WelcomeTour onClose={tour.close} />}
      {requestMatch && (
        <SwapRequestModal
          key={requestMatch.id}
          offer={requestMatch}
          existingSessionAt={requestMatch.nextSessionAt}
          credits={wallet.status === 'ready' ? (wallet.wallet?.credits ?? null) : null}
          onClose={() => setRequestMatch(null)}
        />
      )}
      {openRequest && (
        <RequestDialog
          key={openRequest.id}
          match={openRequest}
          onClose={() => setOpenRequest(null)}
          onDone={(message) => {
            setOpenRequest(null)
            refreshAll(message)
          }}
        />
      )}
      {/* Always mounted, so the rating step can follow a drawer that has already closed. */}
      <SettleSessionDialogs session={settling?.session ?? null} mode={settling?.mode ?? 'resolve'} onClose={() => setSettling(null)} onSettled={afterSettle} />
    </>
  )
}
