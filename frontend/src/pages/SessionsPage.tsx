import { useState } from 'react'
import { Link } from 'react-router-dom'
import SessionCard from '../components/cards/SessionCard'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import Skeleton from '../components/common/Skeleton'
import Tabs from '../components/common/Tabs'
import CancelSessionModal from '../components/schedule/CancelSessionModal'
import ConfirmCompletionDrawer from '../components/schedule/ConfirmCompletionDrawer'
import OutcomeBanners from '../components/schedule/OutcomeBanners'
import PostSessionDrawer from '../components/schedule/PostSessionDrawer'
import ReviewModal from '../components/schedule/ReviewModal'
import { useCurrentUser } from '../hooks/useAuth'
import { useAsyncData } from '../hooks/useAsyncData'
import { useNow } from '../hooks/useNow'
import { useWallet } from '../hooks/useWallet'
import { useChatEvents } from '../hooks/useWebSocket'
import { fetchMySessions } from '../services/sessionService'
import type { SessionDetail } from '../types'
import { canOfferAlternatives, getSessionPhase, releasesCreditNow } from '../utils/sessions'

type SessionTab = 'upcoming' | 'past'
type Dialog =
  | { kind: 'cancel' | 'reschedule'; session: SessionDetail }
  | { kind: 'resolve' | 'confirm' | 'review'; session: SessionDetail }

const TABS: { id: SessionTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming Sessions' },
  { id: 'past', label: 'Past & Completed Sessions' },
]

export default function SessionsPage() {
  const { id: myId } = useCurrentUser()
  const { refresh: refreshWallet } = useWallet()
  const sessions = useAsyncData(fetchMySessions)
  const now = useNow()
  const [activeTab, setActiveTab] = useState<SessionTab>('upcoming')
  const [dialog, setDialog] = useState<Dialog | null>(null)

  const all = sessions.data ?? []
  const phaseOf = (session: SessionDetail) => getSessionPhase(session, now)
  const startMs = (session: SessionDetail) => Date.parse(session.startsAt)
  const upcoming = all.filter((session) => phaseOf(session) === 'confirmed').sort((a, b) => startMs(a) - startMs(b))
  const past = all.filter((session) => phaseOf(session) !== 'confirmed').sort((a, b) => startMs(b) - startMs(a))
  const needsOutcome = all.filter((session) => phaseOf(session) === 'awaiting_settlement')
  const needsConfirmation = all.filter((session) => phaseOf(session) === 'pending_learner_review' && !session.isTeaching)
  const visible = activeTab === 'upcoming' ? upcoming : past

  // Credits can move with any of these actions, so the balance reloads with the list.
  function refresh() {
    sessions.retry()
    refreshWallet()
  }

  // A request accepted elsewhere adds a session here, without waiting for a reload.
  // WalletProvider already reloads the balance on chat events, so only the list reloads here.
  useChatEvents(sessions.retry)

  const closeAndRefresh = () => {
    setDialog(null)
    refresh()
  }

  return (
    <>
      <title>Sessions · Skill Swap</title>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Sessions</h1>

        {/* Shown on both tabs, so a session waiting on the member is never missed. */}
        <OutcomeBanners
          needsOutcome={needsOutcome}
          needsConfirmation={needsConfirmation}
          onResolve={(session) => setDialog({ kind: 'resolve', session })}
          onConfirm={(session) => setDialog({ kind: 'confirm', session })}
        />

        <div className="mt-6">
          <Tabs label="Session type" tabs={TABS} active={activeTab} onChange={setActiveTab}>
            {sessions.data === null && sessions.status === 'loading' && (
              <div role="status" aria-label="Loading sessions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            )}
            {sessions.status === 'error' && <AlertBanner message="We couldn't load your sessions." onRetry={sessions.retry} />}
            {sessions.data !== null && sessions.status !== 'error' && visible.length === 0 && (
              activeTab === 'upcoming' ? (
                <EmptyState
                  title="No upcoming sessions"
                  description="Request a swap with a mentor to book your next session."
                  action={<Link to="/explore" className={getButtonClasses('secondary')}>Find a mentor</Link>}
                />
              ) : (
                <EmptyState title="No past sessions yet" description="Sessions appear here once they've ended or been cancelled." />
              )
            )}
            {sessions.status !== 'error' && visible.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((session) => (
                  <li key={session.id}>
                    <SessionCard
                      session={session}
                      now={now}
                      onReschedule={(item) => setDialog({ kind: 'reschedule', session: item })}
                      onCancel={(item) => setDialog({ kind: 'cancel', session: item })}
                      onResolve={(item) => setDialog({ kind: 'resolve', session: item })}
                      onConfirm={(item) => setDialog({ kind: 'confirm', session: item })}
                      onReview={(item) => setDialog({ kind: 'review', session: item })}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Tabs>
        </div>
      </main>

      {(dialog?.kind === 'cancel' || dialog?.kind === 'reschedule') && (
        <CancelSessionModal
          key={dialog.session.id}
          session={dialog.session}
          mode={dialog.kind}
          canOfferTimes={canOfferAlternatives(dialog.session, myId)}
          onClose={() => setDialog(null)}
          onDone={closeAndRefresh}
        />
      )}
      {dialog?.kind === 'resolve' && (
        <PostSessionDrawer
          session={dialog.session}
          onClose={() => setDialog(null)}
          // Rating comes straight after a session closes, while it's fresh in the member's mind.
          // A teacher's marking doesn't close it, so there's nothing to rate yet.
          onCompleted={() => {
            if (!releasesCreditNow(dialog.session, myId)) {
              closeAndRefresh()
              return
            }
            refresh()
            setDialog({ kind: 'review', session: dialog.session })
          }}
          onReported={closeAndRefresh}
        />
      )}
      {dialog?.kind === 'confirm' && (
        <ConfirmCompletionDrawer
          session={dialog.session}
          onClose={() => setDialog(null)}
          onConfirmed={() => {
            refresh()
            setDialog({ kind: 'review', session: dialog.session })
          }}
          onDisputed={closeAndRefresh}
        />
      )}
      {dialog?.kind === 'review' && (
        <ReviewModal session={dialog.session} onClose={closeAndRefresh} onSubmitted={closeAndRefresh} />
      )}
    </>
  )
}
