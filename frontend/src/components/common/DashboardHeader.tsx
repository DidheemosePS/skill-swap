import { Link } from 'react-router-dom'
import { useNow } from '../../hooks/useNow'
import { getButtonClasses } from './buttonStyles'

interface DashboardHeaderProps {
  firstName: string
  // Null until sessions and matches have loaded, so the line never states a count it doesn't know.
  needsCount: number | null
}

const greeting = (hour: number) => (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')

// A compact app header: who and when on the left, the page's standing action on the right. Always the outline
// button: the filled ones belong to the cards (Join, an owed step), and a fixed style never changes on load. The specific
// task is the inbox's job, so the header only counts it.
export default function DashboardHeader({ firstName, needsCount }: DashboardHeaderProps) {
  // From the shared clock, so the greeting and date stay right if the page is left open past midnight.
  const now = new Date(useNow(60_000))
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-balance text-ink sm:text-4xl">{greeting(now.getHours())}, {firstName}</h1>
        <p className="mt-1.5 min-h-6 text-sm text-muted">
          {today}
          {needsCount !== null && <> · {needsCount === 0 ? 'All caught up' : <><span className="figures">{needsCount}</span> {needsCount === 1 ? 'thing' : 'things'} to do</>}</>}
        </p>
      </div>
      <Link to="/explore" className={getButtonClasses('secondary', 'max-sm:hidden')}>Find a swap</Link>
    </div>
  )
}
