import { Link, NavLink } from 'react-router-dom'
import AvatarMenu from './AvatarMenu'
import BottomTabs from './BottomTabs'
import { countLabel, NAV_LINKS } from './navLinks'
import type { NavCountKey } from './navLinks'
import NavCount from './NavCount'
import Sidebar from './Sidebar'
import Skeleton from './Skeleton'
import WalletChip from './WalletChip'
import BrandMark from './BrandMark'

interface NavbarProps {
  // Null while loading or after a failed load, so the chip never shows a wrong balance.
  credits: number | null
  heldCredits: number | null
  counts: Record<NavCountKey, number>
  name: string
  avatarUrl: string | null
  profileId: string
  // The reload screen draws the real frame before the member has loaded: account and balance show as placeholders.
  placeholder?: boolean
}

const pillClasses =
  'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium outline-none transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent'

// From lg up the app sits in a left sidebar. Below it, one header row: the places (with their own counts),
// the balance chip and the account menu; phones move the places to bottom tabs.
export default function Navbar({ credits, heldCredits, counts, name, avatarUrl, profileId, placeholder = false }: NavbarProps) {
  return (
    <>
      <Sidebar credits={credits} heldCredits={heldCredits} counts={counts} name={name} avatarUrl={avatarUrl} profileId={profileId} placeholder={placeholder} />
      <header className="sticky top-0 z-20 border-b border-line bg-shell lg:hidden">
        {/* Lets keyboard users jump past the nav; it only appears while focused. */}
        <a
          href="#main"
          className="sr-only rounded-lg bg-accent text-sm font-semibold text-white outline-none focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-30 focus:px-4 focus:py-2.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Skip to content
        </a>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
          <Link to="/dashboard" className="mr-auto inline-flex min-h-11 items-center rounded font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-accent md:mr-0">
            <BrandMark />
          </Link>
          <nav aria-label="Main" className="ml-6 hidden gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const count = link.countKey ? counts[link.countKey] : 0
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  aria-label={countLabel(link.label, link.countKey, count)}
                  // A filled pill as well as colour, so the current page doesn't rely on colour alone.
                  className={({ isActive }) => `${pillClasses} ${isActive ? 'bg-next-soft text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {link.label}
                  <NavCount value={count} />
                </NavLink>
              )
            })}
          </nav>
          <div className="flex items-center gap-1 md:ml-auto sm:gap-2">
            {placeholder ? (
              <>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="m-1 size-9 rounded-full" />
              </>
            ) : (
              <>
                <WalletChip credits={credits} heldCredits={heldCredits} />
                <AvatarMenu name={name} avatarUrl={avatarUrl} profileId={profileId} />
              </>
            )}
          </div>
        </div>
      </header>
      <BottomTabs counts={counts} />
    </>
  )
}
