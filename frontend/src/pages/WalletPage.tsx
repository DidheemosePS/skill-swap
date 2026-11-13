import { Link, useSearchParams } from 'react-router-dom'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import Tabs from '../components/common/Tabs'
import { LEDGER_FILTERS, matchesFilter, parseFilter } from '../components/wallet/ledgerFilters'
import type { LedgerFilter } from '../components/wallet/ledgerFilters'
import ActivityFeed from '../components/wallet/ActivityFeed'
import WelcomeTour from '../components/common/WelcomeTour'
import WalletSummary from '../components/wallet/WalletSummary'
import { useAsyncData } from '../hooks/useAsyncData'
import { useNow } from '../hooks/useNow'
import { useWallet } from '../hooks/useWallet'
import { useWelcomeTour } from '../hooks/useWelcomeTour'
import { useChatEvents } from '../hooks/useWebSocket'
import { fetchTransactions } from '../services/walletService'
import { LedgerRowsSkeleton } from '../components/common/pageSkeletons'

const FILTER_EMPTY: Record<Exclude<LedgerFilter, 'all'>, { title: string; description: string }> = {
  earned: { title: 'Nothing earned yet', description: 'Teach an hour to earn a credit.' },
  spent: { title: 'Nothing spent yet', description: 'Book a session to use a credit.' },
  escrow: { title: 'Nothing held', description: 'Credits for booked sessions show here.' },
}

// Same frame as the dashboard: the list you work through on the left, the balance beside it.
export default function WalletPage() {
  const wallet = useWallet()
  const ledger = useAsyncData(fetchTransactions)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = parseFilter(searchParams.get('filter'))
  const now = useNow(60_000)
  const tour = useWelcomeTour()

  const entries = ledger.data ?? []
  const visible = entries.filter((entry) => matchesFilter(entry, filter))
  const tabs = LEDGER_FILTERS.map(({ id, label }) => ({
    id,
    label: ledger.data ? <>{label}<span className="figures ml-1.5 opacity-70">{entries.filter((entry) => matchesFilter(entry, id)).length}</span></> : label,
  }))

  // Replace rather than push, so switching filters doesn't fill the back button's history.
  const setFilter = (next: LedgerFilter) => setSearchParams(next === 'all' ? {} : { filter: next }, { replace: true })

  // An accepted or declined request elsewhere can move a credit. WalletProvider reloads the balance,
  // so only the ledger needs reloading here.
  useChatEvents(ledger.retry)

  return (
    <>
      <title>Wallet · Skill Swap</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className="outline-none mx-auto max-w-page px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Wallet</h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4 xl:col-start-9">
            <WalletSummary wallet={wallet.wallet} status={wallet.status} onRetry={wallet.refresh} onReplayTour={tour.open} />
          </div>

          <section aria-labelledby="ledger-heading" className="rounded-2xl bg-card lg:col-span-7 lg:col-start-1 lg:row-start-1 xl:col-span-8">
            <h2 id="ledger-heading" className="sr-only">Transactions</h2>
            <Tabs label="Filter transactions" tabs={tabs} active={filter} onChange={setFilter} listClassName="border-b border-line px-4 py-3 sm:px-6" panelClassName="">
              {ledger.data === null && ledger.status === 'loading' && (
                <div role="status" aria-label="Loading transactions"><LedgerRowsSkeleton /></div>
              )}
              {ledger.status === 'error' && <div className="p-5"><AlertBanner tone="inset" message="We couldn't load your transactions." onRetry={ledger.retry} /></div>}
              {ledger.data !== null && ledger.status !== 'error' && visible.length === 0 && (
                <div className="p-5">
                  {filter === 'all' ? (
                    <EmptyState
                      icon="ledger"
                      tone="inset"
                      title="No transactions yet"
                      description="Credits you earn and spend show here."
                      action={<Link to="/explore" className={getButtonClasses('secondary')}>Find a mentor</Link>}
                    />
                  ) : (
                    <EmptyState icon="ledger" tone="inset" {...FILTER_EMPTY[filter]} />
                  )}
                </div>
              )}
              {ledger.status !== 'error' && visible.length > 0 && <div className="px-4 pt-2 pb-2 sm:px-6"><ActivityFeed entries={visible} now={now} /></div>}
            </Tabs>
          </section>
        </div>
      </main>
      {tour.isOpen && <WelcomeTour onClose={tour.close} />}
    </>
  )
}
