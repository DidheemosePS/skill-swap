import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed'
import AvatarMenu from './AvatarMenu'
import { SidebarIcon } from './icons'
import { countLabel, NAV_LINKS } from './navLinks'
import type { NavCountKey } from './navLinks'
import NavCount from './NavCount'
import BrandMark from './BrandMark'
import Skeleton from './Skeleton'

interface SidebarProps {
  credits: number | null
  heldCredits: number | null
  counts: Record<NavCountKey, number>
  name: string
  avatarUrl: string | null
  profileId: string
  placeholder?: boolean
}

const walletIcon = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h14v-11H6.5A2.5 2.5 0 0 1 4 7.5Z" />
    <circle cx="16" cy="13.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

// The desktop frame every page sits in. Full, it shows the places with their counts and the balance; collapsed,
// it keeps an icon rail so every place stays one click away. globals.css offsets the page by its width.
export default function Sidebar({ credits, heldCredits, counts, name, avatarUrl, profileId, placeholder = false }: SidebarProps) {
  const { isCollapsed, toggle } = useSidebarCollapsed()
  const itemClasses = ({ isActive }: { isActive: boolean }) =>
    `relative flex min-h-10 items-center gap-3 rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
      isCollapsed ? 'justify-center' : 'px-3'
    } ${isActive ? 'bg-next-soft text-ink' : 'text-muted hover:bg-canvas hover:text-ink'}`
  // The icons are drawn at 24px for the phone tabs; the sidebar shows them at 18px.
  const icon = (node: ReactNode) => <span className="shrink-0 [&>svg]:size-[1.125rem]">{node}</span>
  const walletLabel = credits === null ? 'Wallet' : `Wallet: ${credits} to spend${heldCredits ? `, ${heldCredits} held` : ''}`

  return (
    <aside
      data-sidebar={isCollapsed ? 'rail' : 'full'}
      className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-line bg-shell py-5 lg:flex ${isCollapsed ? 'w-16 px-2' : 'w-60 px-3'}`}
    >
      <a href="#main" className="sr-only rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30">
        Skip to content
      </a>
      <div className={`mb-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link to="/dashboard" className="rounded px-3 py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <BrandMark />
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          className="inline-flex size-9 items-center justify-center rounded-lg text-muted outline-none transition-colors hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          <SidebarIcon className="size-[1.125rem]" />
        </button>
      </div>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {NAV_LINKS.map((link) => {
          const count = link.countKey ? counts[link.countKey] : 0
          return (
            <NavLink
              key={link.to}
              to={link.to}
              aria-label={countLabel(link.label, link.countKey, count) ?? (isCollapsed ? link.label : undefined)}
              title={isCollapsed ? link.label : undefined}
              className={itemClasses}
            >
              {icon(link.icon)}
              {isCollapsed ? (
                // On the rail a count shrinks to a dot on the icon; the link's label still says the number.
                count > 0 && <span aria-hidden="true" className="absolute top-1.5 right-2.5 size-2 rounded-full bg-ink ring-2 ring-shell" />
              ) : (
                <>
                  <span className="flex-1">{link.label}</span>
                  <NavCount value={count} />
                </>
              )}
            </NavLink>
          )
        })}
        {/* The balance as a place to go, said with its nouns, rather than a badge to decode. */}
        <NavLink to="/wallet" aria-label={walletLabel} title={isCollapsed ? walletLabel : undefined} className={itemClasses}>
          {icon(walletIcon)}
          {!isCollapsed && (
            <>
              <span className="flex-1">Wallet</span>
              {credits !== null && (
                <span className="figures text-xs font-normal text-muted">
                  {credits} to spend
                  {heldCredits ? <> · <span className="text-held">{heldCredits} held</span></> : null}
                </span>
              )}
            </>
          )}
        </NavLink>
      </nav>
      <div className="mt-auto border-t border-line pt-3">
        {placeholder ? (
          <div className={`flex min-h-11 items-center gap-3 py-1.5 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <Skeleton className="size-9 shrink-0 rounded-full" />
            {!isCollapsed && <Skeleton className="h-4 w-24" />}
          </div>
        ) : (
          <AvatarMenu name={name} avatarUrl={avatarUrl} profileId={profileId} inSidebar showName={!isCollapsed} />
        )}
      </div>
    </aside>
  )
}
