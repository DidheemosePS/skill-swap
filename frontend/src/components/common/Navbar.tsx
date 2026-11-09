import { Link, NavLink } from 'react-router-dom'
import AvatarMenu from './AvatarMenu'
import type { NavItem } from './AvatarMenu'

interface NavbarProps {
  // Null while loading or after a failed load, so the link never shows a wrong balance.
  credits: number | null
  unreadCount: number
  name: string
  avatarUrl: string | null
  profileId: string
}

const PRIMARY_LINKS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/explore', label: 'Explore' },
  { to: '/messages', label: 'Messages' },
  { to: '/sessions', label: 'Sessions' },
]

const pillClasses =
  'inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent'

export default function Navbar({ credits, unreadCount, name, avatarUrl, profileId }: NavbarProps) {
  const creditLabel = credits === 1 ? '1 Credit' : `${credits} Credits`
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
        <Link to="/dashboard" className="rounded font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Skill Swap
        </Link>
        <nav aria-label="Main" className="ml-6 hidden gap-1 md:flex">
          {PRIMARY_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${pillClasses} ${isActive ? 'text-accent-strong' : 'text-muted'}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/wallet" className={`${pillClasses} whitespace-nowrap`}>
            <span aria-hidden="true" className="mr-1">⚡</span>
            {credits === null ? 'Wallet' : creditLabel}
          </Link>
          <Link
            to="/messages"
            aria-label={unreadCount > 0 ? `Notifications: ${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}` : 'Notifications'}
            className="relative flex size-10 items-center justify-center rounded-lg text-muted outline-none transition-colors hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9" />
              <path d="M10 20a2.2 2.2 0 0 0 4 0" />
            </svg>
            {unreadCount > 0 && (
              <span aria-hidden="true" className="absolute top-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-danger text-[11px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <AvatarMenu name={name} avatarUrl={avatarUrl} primaryLinks={PRIMARY_LINKS} profileId={profileId} />
        </div>
      </div>
    </header>
  )
}
