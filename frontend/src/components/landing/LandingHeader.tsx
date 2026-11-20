import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import BrandMark from '../common/BrandMark'
import Skeleton from '../common/Skeleton'
import { getButtonClasses } from '../common/buttonStyles'

// The landing page's own top bar: no app places, no wallet chip, just the brand,
// two section anchors and the way in. Visitors get Sign in and Get started (both to
// /login); a signed-in member gets one button straight into the app instead. While
// the session check runs, the slot holds a button-shaped placeholder, so the bar
// never flashes visitor buttons at a member.
export default function LandingHeader() {
  const { user, status } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <a href="#top" aria-label="Skill Swap, back to top" className="inline-flex min-h-11 items-center">
          <BrandMark />
        </a>
        <nav aria-label="Landing sections" className="ml-auto flex items-center gap-1 sm:gap-2">
          <a href="#how" className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted hover:bg-canvas hover:text-ink sm:inline-flex">
            How it works
          </a>
          <a href="#credits" className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted hover:bg-canvas hover:text-ink sm:inline-flex">
            Credits
          </a>
          {user ? (
            <Link to="/dashboard" className={getButtonClasses('primary')}>
              Go to dashboard
            </Link>
          ) : status === 'loading' ? (
            <Skeleton className="h-11 w-36 rounded-xl" />
          ) : (
            <>
              <Link to="/login" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-canvas">
                Sign in
              </Link>
              <Link to="/login" className={getButtonClasses('primary')}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
