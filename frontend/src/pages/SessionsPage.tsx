import { useState } from 'react'
import { Link } from 'react-router-dom'
import SessionOutcomeNote from '../components/cards/SessionOutcomeNote'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import CancelSessionModal from '../components/schedule/CancelSessionModal'
import HistoryStatement from '../components/schedule/HistoryStatement'
import PaperRow from '../components/schedule/PaperRow'
import ReviewModal from '../components/schedule/ReviewModal'
import SessionAgenda from '../components/schedule/SessionAgenda'
import SessionsSection from '../components/schedule/SessionsSection'
import SettleSessionDialogs from '../components/schedule/SettleSessionDialogs'
import UnderReviewList from '../components/schedule/UnderReviewList'
import { useCurrentUser } from '../hooks/useAuth'
import type { SettleMode } from '../hooks/useDashboard'
import { useSessionsPage } from '../hooks/useSessionsPage'
import { useWallet } from '../hooks/useWallet'
import { useChatEvents } from '../hooks/useWebSocket'
import type { SessionDetail } from '../types'
import { canOfferAlternatives, getHistoryTotals } from '../utils/sessions'
import { SessionsSkeleton } from '../components/common/pageSkeletons'
import { useToast } from '../hooks/useToast'

// What a cancellation did to credits, said with the outcome, since the row it came from moves to History.
function cancelledMessage({ partner, swapType, isTeaching }: SessionDetail) {
  const first = partner.name.split(' ')[0]
  const credit = swapType === 'two_way' ? '' : isTeaching ? ` ${first}'s credit went back to them.` : ' Your 1 credit is back.'
  return `Cancelled your session with ${first}.${credit}`
}

type Dialog = { kind: 'cancel' | 'reschedule' | 'review'; session: SessionDetail }

// History grows forever; the latest few answer "what happened lately", the rest wait behind one button.
const HISTORY_SHOWN = 5

// One page, read top to bottom: what's ended and waiting to be confirmed, what's coming (the session starting
// now joins from its own row), and a statement of what's done. The dashboard keeps the short version.
export default function SessionsPage() {
  const { id: myId } = useCurrentUser()
  const { refresh: refreshWallet } = useWallet()
  const page = useSessionsPage()
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [settle, setSettle] = useState<{ session: SessionDetail; mode: SettleMode } | null>(null)
  const toast = useToast()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  // A request accepted elsewhere adds a session here without a reload; the wallet reloads itself on chat events.
  useChatEvents(page.retry)

  // Credits can move with any action here, so the balance reloads with the list, and the toast says what moved.
  function done(message: string) {
    setDialog(null)
    setSettle(null)
    toast.success(message)
    page.retry()
    refreshWallet()
  }

  const totals = getHistoryTotals(page.history, myId)
  const isEmpty = page.hasLoaded && page.requestsSettled && !page.toSettle.length && !page.agenda.length && !page.checking.length && !page.history.length

  return (
    <>
      <title>Sessions · Skill Swap</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className="mx-auto max-w-page px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-10">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Sessions</h1>
        {page.hasLoaded && (
          <p className="mt-1.5 text-sm text-muted">
            <span className="figures">{page.toSettle.length}</span> to confirm · <span className="figures">{page.agenda.length}</span> coming up
          </p>
        )}
        {page.status === 'error' && <div className="mt-6"><AlertBanner message="We couldn't load your sessions." onRetry={page.retry} /></div>}
        {!page.hasLoaded && page.status === 'loading' && (
          <div role="status" aria-label="Loading sessions"><SessionsSkeleton /></div>
        )}
        {/* Said outside Coming up, so it shows even when there are no sessions to put it under. */}
        {page.requestsFailed && <p role="status" className="mt-6 text-sm text-muted">Requests didn't load. <button type="button" onClick={page.retry} className="font-medium text-accent-strong hover:underline">Try again</button></p>}
        {isEmpty && (
          <div className="mt-6">
            <EmptyState icon="calendar" title="No sessions yet" description="Booked sessions show here." action={<Link to="/explore" className={getButtonClasses('secondary')}>Explore members</Link>} />
          </div>
        )}


        {page.toSettle.length > 0 && (
          <SessionsSection id="to-confirm" title="To confirm" meta="Your answer settles the credit">
            <ul className="grid gap-4 md:grid-cols-2">
              {page.toSettle.map(({ session, mode }) => {
                const first = session.partner.name.split(' ')[0]
                return (
                  <PaperRow
                    key={session.id}
                    person={session.partner}
                    title={mode === 'confirm' ? `${first} marked your ${session.skillName} session complete` : `Did your ${session.skillName} session with ${first} happen?`}
                    action={<button type="button" onClick={() => setSettle({ session, mode })} className={getButtonClasses('primary', 'lg:min-h-9 lg:px-4')}>{mode === 'confirm' ? 'Confirm' : 'Did it happen?'}</button>}
                  >
                    <SessionOutcomeNote session={session} phase={mode === 'confirm' ? 'pending_learner_review' : 'awaiting_settlement'} now={page.now} />
                  </PaperRow>
                )
              })}
            </ul>
          </SessionsSection>
        )}

        {/* Already answered, now with someone else: a notice with a timer, kept apart from the jobs above. */}
        {page.checking.length > 0 && (
          <SessionsSection id="under-review" title="Under review" meta="Nothing to do. These settle on their own">
            <UnderReviewList sessions={page.checking} now={page.now} />
          </SessionsSection>
        )}

        {page.hasLoaded && !isEmpty && (
          <SessionsSection id="coming-up" title="Coming up">
            {page.agenda.length > 0 ? (
              <SessionAgenda
                items={page.agenda}
                now={page.now}
                imminentId={page.imminent?.id ?? null}
                onReschedule={(session) => setDialog({ kind: 'reschedule', session })}
                onCancel={(session) => setDialog({ kind: 'cancel', session })}
              />
            ) : (
              <EmptyState icon="calendar" title="Nothing booked" action={<Link to="/explore" className={getButtonClasses('secondary', 'lg:min-h-9 lg:px-4')}>Find someone</Link>} />
            )}
          </SessionsSection>
        )}

        {page.history.length > 0 && (
          <SessionsSection id="history" title="Past" meta={<><span className="figures">+{totals.earned}</span> earned · <span className="figures">−{totals.spent}</span> spent</>}>
            <HistoryStatement
              sessions={isHistoryOpen ? page.history : page.history.slice(0, HISTORY_SHOWN)}
              now={page.now}
              onReview={(session) => setDialog({ kind: 'review', session })}
              footer={page.history.length > HISTORY_SHOWN && (
                <div className="border-t border-line/70 py-1">
                  <button type="button" onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="inline-flex min-h-11 items-center rounded text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
                    {isHistoryOpen ? 'Show fewer' : <>Show all <span className="figures ml-1 text-muted">· {page.history.length - HISTORY_SHOWN} more</span></>}
                  </button>
                </div>
              )}
            />
          </SessionsSection>
        )}
      </main>

      {(dialog?.kind === 'cancel' || dialog?.kind === 'reschedule') && (
        <CancelSessionModal
          key={dialog.session.id}
          session={dialog.session}
          mode={dialog.kind}
          canOfferTimes={canOfferAlternatives(dialog.session, myId)}
          onClose={() => setDialog(null)}
          onDone={() => done(dialog.kind === 'cancel' ? cancelledMessage(dialog.session) : `New times sent to ${dialog.session.partner.name.split(' ')[0]}. The old time is free; it's booked again once they pick one.`)}
        />
      )}
      {dialog?.kind === 'review' && (
        <ReviewModal session={dialog.session} onClose={() => setDialog(null)} onSubmitted={() => done(`Thanks. Your review of ${dialog.session.partner.name.split(' ')[0]} is posted.`)} />
      )}
      {/* The same settle-then-rate flow the dashboard and Messages run. */}
      <SettleSessionDialogs session={settle?.session ?? null} mode={settle?.mode ?? 'resolve'} onClose={() => setSettle(null)} onSettled={done} />
    </>
  )
}
