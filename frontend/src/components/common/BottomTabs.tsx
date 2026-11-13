import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { countLabel, NAV_LINKS } from './navLinks'
import type { NavCountKey } from './navLinks'
import NavCount from './NavCount'

// Phones keep the four places in thumb reach at the bottom, so the header is a single row. The body gets
// matching bottom padding in globals.css (via data-bottom-tabs), so no page content hides behind it.
export default function BottomTabs({ counts }: { counts: Record<NavCountKey, number> }) {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  // An open chat thread takes the whole phone screen, like a messaging app; its Back button returns to the
  // list, where the tabs come back. Without them the body's bottom padding drops too (it keys off this nav).
  if (pathname === '/messages' && (params.has('c') || params.has('peer'))) return null
  return (
    <nav
      aria-label="Main"
      data-bottom-tabs
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-shell pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_LINKS.map((link) => {
        const count = link.countKey ? counts[link.countKey] : 0
        return (
          <NavLink
            key={link.to}
            to={link.to}
            aria-label={countLabel(link.label, link.countKey, count) ?? link.label}
            className={({ isActive }) =>
              `relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                isActive ? 'text-next before:absolute before:inset-x-[22%] before:top-0 before:h-0.75 before:rounded-b before:bg-next' : 'text-muted'
              }`
            }
          >
            {link.icon}
            {/* Sits on the icon's top-right corner, where phone tab counts are expected. */}
            <span className="absolute top-1.5 left-[calc(50%+0.25rem)]"><NavCount value={count} /></span>
            {link.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
