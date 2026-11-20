import { Link, useLocation } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import { getButtonClasses } from '../components/common/buttonStyles'
import { useAuth } from '../hooks/useAuth'

// Two empty seats around the exchange mark: nobody swaps at this address. The one
// picture on the page, same grammar as SwapPair and the landing demo's open seat.
function EmptySeats() {
  return (
    <span aria-hidden="true" className="flex items-center">
      <span className="grid size-14 place-items-center rounded-full border-2 border-dashed border-line text-xl font-semibold text-faint ring-[3px] ring-surface">?</span>
      <span className="relative z-10 -mx-2 grid size-7 place-items-center rounded-full bg-white text-ink ring-[3px] ring-surface">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />
        </svg>
      </span>
      <span className="grid size-14 place-items-center rounded-full border-2 border-dashed border-line text-xl font-semibold text-faint ring-[3px] ring-surface">?</span>
    </span>
  )
}

// Catch-all for unknown URLs. It sits outside AuthGate so visitors see it too, and
// the actions adapt: members go back to their home base, visitors to the landing.
export default function NotFoundPage() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  return (
    // The brand sits out of the flow, so the content centres on the browser window
    // itself rather than on the space left under the brand row. The symmetric
    // vertical padding keeps that true centre while clearing the brand on short screens.
    <main className="relative flex min-h-dvh flex-col justify-center px-4 py-20 sm:px-8">
      <title>Page not found · Skill Swap</title>
      <Link to="/" aria-label="Skill Swap home" className="absolute top-4 left-4 inline-flex min-h-11 items-center sm:left-8">
        <BrandMark />
      </Link>
      <div className="mx-auto w-full max-w-md">
        <EmptySeats />
        <p className="figures mt-8 font-display text-6xl font-semibold tracking-tight text-ink">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-balance text-ink">There’s no page here</h1>
        <p className="mt-2 text-pretty text-muted">
          <span className="font-medium text-ink [overflow-wrap:anywhere]">{pathname}</span> doesn’t match anything on Skill Swap. The address may be mistyped, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className={getButtonClasses('primary')}>
                Go to your dashboard
              </Link>
              <Link to="/explore" className={getButtonClasses('secondary')}>
                Explore members
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className={getButtonClasses('primary')}>
                Go to the home page
              </Link>
              <Link to="/login" className={getButtonClasses('secondary')}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
