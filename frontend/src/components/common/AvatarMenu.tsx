import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from './Avatar'

export interface NavItem {
  to: string
  label: string
}

interface AvatarMenuProps {
  name: string
  avatarUrl: string | null
  primaryLinks: NavItem[]
  profileId: string
}

const itemClasses =
  'block rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent'

export default function AvatarMenu({ name, avatarUrl, primaryLinks, profileId }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [signOutState, setSignOutState] = useState<'idle' | 'pending' | 'failed'>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const { signOut } = useAuth()

  // On success AuthGate replaces the whole app with the sign-in panel, so only failure needs handling.
  async function handleSignOut() {
    setSignOutState('pending')
    try {
      await signOut()
    } catch {
      setSignOutState('failed')
    }
  }

  // Listeners exist only while open, so a closed menu costs nothing.
  useEffect(() => {
    if (!isOpen) return
    const closeIfOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="Account menu"
        onClick={() => {
          setIsOpen((current) => !current)
          setSignOutState('idle')
        }}
        className="flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <Avatar name={name} url={avatarUrl} size="sm" />
      </button>
      {isOpen && (
        // Links can stay on the same page component (profile to profile), so a click must close it too.
        <nav
          aria-label="Account"
          onClick={() => setIsOpen(false)}
          className="absolute right-0 mt-2 w-52 rounded-lg border border-line bg-surface p-1 shadow-lg"
        >
          {/* The main links only show in the header from the md breakpoint up. */}
          {primaryLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`${itemClasses} md:hidden`}>
              {link.label}
            </Link>
          ))}
          <Link to={`/user/${profileId}`} className={itemClasses}>Public profile</Link>
          <Link to="/wallet" className={itemClasses}>Wallet</Link>
          <Link to="/settings" className={itemClasses}>Settings</Link>
          <div className="my-1 border-t border-line" />
          {/* Stops the click reaching the nav, so the menu stays open to show progress or an error. */}
          <button
            type="button"
            disabled={signOutState === 'pending'}
            aria-busy={signOutState === 'pending'}
            onClick={(event) => {
              event.stopPropagation()
              handleSignOut()
            }}
            className={`${itemClasses} w-full text-left disabled:text-muted`}
          >
            {signOutState === 'pending' ? 'Signing out…' : 'Sign out'}
          </button>
          {signOutState === 'failed' && (
            <p role="alert" className="px-3 pb-2 text-xs text-danger">We couldn't sign you out. Please try again.</p>
          )}
        </nav>
      )}
    </div>
  )
}
