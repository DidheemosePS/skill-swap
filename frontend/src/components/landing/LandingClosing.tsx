import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import BrandMark from '../common/BrandMark'
import Skeleton from '../common/Skeleton'
import { getButtonClasses } from '../common/buttonStyles'
import { DEMO_ROSTER } from '../../data/landingDemo'

// Closing call to action over the example face pile. The page's last section, inside <main>.
export default function LandingClosing() {
  const { user, status } = useAuth()
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center lg:py-18">
      <span aria-hidden="true" className="flex">
        {DEMO_ROSTER.map((person) => (
          <span key={person.name} className="-ml-2.5 rounded-full ring-[3px] ring-surface first:ml-0">
            <Avatar name={person.name} url={null} size="sm" />
          </span>
        ))}
      </span>
      <h2 className="font-display text-3xl font-semibold text-balance text-ink sm:text-4xl">Your first credit is free.</h2>
      <p className="max-w-md text-[0.9375rem] text-muted">
        Set up your profile in three steps (what you teach, what you want to learn, when you’re free) and start with one credit on the house.
      </p>
      {status === 'loading' && !user ? (
        // Same hold as the top bar: no visitor button flashes at a member mid-session-check.
        <Skeleton className="h-11 w-32 rounded-xl" />
      ) : (
        <Link to={user ? '/dashboard' : '/login'} className={getButtonClasses('primary')}>
          {user ? 'Go to dashboard' : 'Get started'}
        </Link>
      )}
    </section>
  )
}

// Outside <main>, so it keeps its own landmark. Its one line keeps the page honest: every person shown here is
// an example, not a member.
export function LandingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2.5 px-4 py-6 text-[0.8125rem] text-faint">
        <BrandMark />
        <p>A peer-to-peer skill exchange. Preview build: everyone shown on this page is an example, not a member.</p>
      </div>
    </footer>
  )
}
