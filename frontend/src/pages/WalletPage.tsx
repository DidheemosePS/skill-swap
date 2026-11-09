import { Link, useSearchParams } from 'react-router-dom'
import AlertBanner from '../components/common/AlertBanner'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import Skeleton from '../components/common/Skeleton'
import Tabs from '../components/common/Tabs'
import { LEDGER_FILTERS, matchesFilter, parseFilter } from '../components/wallet/ledgerFilters'
import type { LedgerFilter } from '../components/wallet/ledgerFilters'
import TransactionTable from '../components/wallet/TransactionTable'
import WalletSummary from '../components/wallet/WalletSummary'
import { useAsyncData } from '../hooks/useAsyncData'
import { useWallet } from '../hooks/useWallet'
import { useChatEvents } from '../hooks/useWebSocket'
import { fetchTransactions } from '../services/walletService'

const FILTER_EMPTY: Record<Exclude<LedgerFilter, 'all'>, { title: string; description: string }> = {
  earned: { title: 'No credits earned yet', description: 'Teach a 1-hour session to a learner to earn your first credit.' },
  spent: { title: 'Nothing spent yet', description: 'Book a session with a mentor to use a credit.' },
  escrow: { title: 'No credits in escrow', description: 'A credit is held here from booking until the session is confirmed.' },
}

export default function WalletPage() {
  const wallet = useWallet()
  const ledger = useAsyncData(fetchTransactions)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = parseFilter(searchParams.get('filter'))

  const entries = ledger.data ?? []
  const visible = entries.filter((entry) => matchesFilter(entry, filter))
  const tabs = LEDGER_FILTERS.map(({ id, label }) => ({
    id,
    label: ledger.data ? `${label} (${entries.filter((entry) => matchesFilter(entry, id)).length})` : label,
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Wallet</h1>
        <div className="mt-6">
          <WalletSummary wallet={wallet.wallet} status={wallet.status} onRetry={wallet.refresh} />
        </div>

        <section aria-labelledby="ledger-heading" className="mt-10">
          <h2 id="ledger-heading" className="mb-4 text-lg font-semibold">Transactions</h2>
          <Tabs label="Filter transactions" tabs={tabs} active={filter} onChange={setFilter}>
            {ledger.data === null && ledger.status === 'loading' && (
              <div role="status" aria-label="Loading transactions" className="space-y-2">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            )}
            {ledger.status === 'error' && <AlertBanner message="We couldn't load your transactions." onRetry={ledger.retry} />}
            {ledger.data !== null && ledger.status !== 'error' && visible.length === 0 && (
              filter === 'all' ? (
                <EmptyState
                  title="No transactions yet"
                  description="Credits you earn by teaching and spend on sessions will appear here."
                  action={<Link to="/explore" className={getButtonClasses('secondary')}>Find a mentor</Link>}
                />
              ) : (
                <EmptyState {...FILTER_EMPTY[filter]} />
              )
            )}
            {ledger.status !== 'error' && visible.length > 0 && <TransactionTable entries={visible} />}
          </Tabs>
        </section>
      </main>
    </>
  )
}
