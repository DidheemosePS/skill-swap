import { useCallback, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDismiss } from '../../hooks/useDismiss'
import Avatar from './Avatar'
import { useToast } from '../../hooks/useToast'

interface AvatarMenuProps {
  name: string
  avatarUrl: string | null
  profileId: string
  // In the sidebar's foot the menu opens upward and the trigger shows the member's name beside the avatar.
  inSidebar?: boolean
  // False on the collapsed rail, where only the avatar fits.
  showName?: boolean
}

const itemClasses =
  'flex min-h-11 items-center rounded-md px-3 text-sm outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent'
// The current page gets the same soft fill as the main links, so these pages are marked too.
const linkClasses = ({ isActive }: { isActive: boolean }) => `${itemClasses} ${isActive ? 'bg-next-soft font-medium text-ink' : ''}`

export default function AvatarMenu({ name, avatarUrl, profileId, inSidebar = false, showName = true }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const toast = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  // On one of the menu's own pages, the avatar carries the current-page mark, since no main link does.
  const isOnMenuPage = pathname === '/wallet' || pathname === '/settings' || pathname === `/user/${profileId}`
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const closeMenu = useCallback(() => setIsOpen(false), [])

  // Navigates explicitly rather than letting AuthGate redirect, so a deliberate sign-out
  // lands on a clean /login with no return-to state pointing back at the page just left.
  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      setIsSigningOut(false)
      toast.error("We couldn't sign you out. Please try again.", handleSignOut)
    }
  }

  useDismiss(containerRef, isOpen, closeMenu, triggerRef)

  return (
    <div ref={containerRef} className={inSidebar ? 'relative w-full' : 'relative'}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        // With the name showing, the name is the label (plus sr-only words), so voice control matches the screen.
        aria-label={inSidebar && showName ? undefined : 'Account menu'}
        onClick={() => setIsOpen((current) => !current)}
        // The 36px avatar sits in a 44px hit area, the minimum touch target.
        className={inSidebar
          ? `flex min-h-11 w-full items-center gap-3 rounded-lg ${showName ? 'px-2' : 'justify-center'} py-1.5 text-left text-sm outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent ${isOnMenuPage ? 'bg-next-soft' : ''}`
          : `flex rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-accent ${isOnMenuPage ? 'bg-next-soft' : ''}`}
      >
        <Avatar name={name} url={avatarUrl} size="sm" />
        {inSidebar && showName && (
          <>
            {' '}
            <span className="min-w-0 flex-1 truncate font-medium text-ink">{name}</span>
            <span className="sr-only">account menu</span>
          </>
        )}
      </button>
      {isOpen && (
        // Links can stay on the same page component (profile to profile), so a click must close it too.
        // Sets its own ink (it opens inside the ultramarine bar); data-popover keeps the bar's white focus rings out.
        <nav
          aria-label="Account"
          data-popover
          onClick={() => setIsOpen(false)}
          className={`absolute z-30 w-60 rounded-2xl border border-line bg-surface p-1.5 text-ink shadow-[0_12px_28px_-8px_rgb(27_29_34/0.28)] ${inSidebar ? 'bottom-full left-0 mb-2' : 'right-0 mt-2'}`}
        >
          {/* The trigger shows only initials, so the menu says whose account it is. */}
          <div className="flex items-center gap-3 px-3 pt-2 pb-3">
            <Avatar name={name} url={avatarUrl} size="sm" />
            <p className="min-w-0 truncate font-display font-semibold">{name}</p>
          </div>
          <div className="mb-1 border-t border-line" />
          <NavLink to={`/user/${profileId}`} className={linkClasses}>Public profile</NavLink>
          <NavLink to="/settings" className={linkClasses}>Settings</NavLink>
          <div className="my-1 border-t border-line" />
          {/* Stops the click reaching the nav, so the menu stays open to show progress. */}
          <button
            type="button"
            disabled={isSigningOut}
            aria-busy={isSigningOut}
            onClick={(event) => {
              event.stopPropagation()
              handleSignOut()
            }}
            className={`${itemClasses} w-full text-left disabled:text-muted`}
          >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </nav>
      )}
    </div>
  )
}
