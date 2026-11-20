import { useState } from 'react'
import MatchFeed from '../components/cards/MatchFeed'
import AppNavbar from '../components/common/AppNavbar'
import DashboardHeader from '../components/common/DashboardHeader'
import ComingUpPanel from '../components/dashboard/ComingUpPanel'
import BoardNeeds from '../components/board/BoardNeeds'
import BoardNextCard from '../components/board/BoardNextCard'
import BoardSettlingCard from '../components/board/BoardSettlingCard'
import BoardTimeStamp from '../components/board/BoardTimeStamp'
import BoardWaitingCard from '../components/board/BoardWaitingCard'
import { needsYouItems, waitingItems } from '../components/dashboard/inboxItems'
import RequestDialog from '../components/schedule/RequestDialog'
import SettleSessionDialogs from '../components/schedule/SettleSessionDialogs'
import SwapRequestModal from '../components/schedule/SwapRequestModal'
import { useCurrentUser } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'
import { useWallet } from '../hooks/useWallet'
import type { MatchRecommendation, SessionDetail } from '../types'
import type { SettleStep } from '../components/schedule/SettlingDrawer'
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
  const [settling, setSettling] = useState<{ session: SessionDetail; step: SettleStep } | null>(null)
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

  const needs = needsYouItems(dashboard.incoming)
  const waiting = waitingItems(dashboard.waitingSessions, dashboard.outgoing)
  const isReady = sessions.status === 'ready' && matches.status === 'ready'

  return (
    <>
      <title>Dashboard · Skill Swap</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-page px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-10">
        <DashboardHeader firstName={user.name.split(' ')[0]} needsCount={isReady ? needs.length : null} />

        {/* The swap board: three columns of pinned cards, each a stack that keeps its own height (left: what's
            next and what waits on others; middle: everything owed; right: the hours and the week ahead). Below xl
            the side columns dissolve (display: contents) into one stack in DOM order, which is also reading and Tab
            order. "Their turn" belongs at the left on desktop but after the hours on phones, so it renders in both
            places and only one is ever displayed (display: none leaves the other out of the tab and reading order). */}
        <div className="mt-6 flex flex-col gap-5 xl:grid xl:grid-cols-12 xl:items-start">
          <div className="contents xl:col-span-4 xl:flex xl:flex-col xl:gap-5">
            {imminent && <BoardNextCard session={imminent} />}
            <BoardWaitingCard items={waiting} onOpenRequest={setOpenRequest} headingId="waiting-heading-wide" className="hidden xl:block" />
          </div>
          <div className="flex flex-col gap-5 xl:col-span-5">
            <BoardNeeds
              status={sessions.status}
              onRetry={sessions.retry}
              needs={needs}
              onOpenRequest={setOpenRequest}
              onChanged={refreshAll}
              primaryFirst={imminent === null}
            />
            <BoardSettlingCard sessions={dashboard.settling} myId={user.id} now={dashboard.now} onOpen={(session, step) => setSettling({ session, step })} />
          </div>
          <div className="contents xl:col-span-3 xl:flex xl:flex-col xl:gap-5">
            <BoardTimeStamp wallet={wallet.wallet} status={wallet.status} onRetry={wallet.refresh} />
            <BoardWaitingCard items={waiting} onOpenRequest={setOpenRequest} className="xl:hidden" />
            <ComingUpPanel status={sessions.status} upcoming={dashboard.upcoming} imminentId={imminent?.id ?? null} />
          </div>
        </div>
        <div className="mt-10">
          <MatchFeed
            matches={dashboard.feedMatches}
            status={matches.status}
            onRetry={matches.retry}
            onRequest={setRequestMatch}
            hasImminent={imminent !== null}
          />
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
      <SettleSessionDialogs session={settling?.session ?? null} step={settling?.step ?? 'confirm'} onClose={() => setSettling(null)} onSettled={afterSettle} />
    </>
  )
}
