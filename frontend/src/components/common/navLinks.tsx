import type { ReactNode } from 'react'

export type NavCountKey = 'messages' | 'sessions'

export interface NavLinkItem {
  to: string
  label: string
  icon: ReactNode
  countKey?: NavCountKey
}

const svg = (path: ReactNode) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
)

// The four places, shared by the desktop links and the phone tabs so they can't drift apart. Messages and
// Sessions carry counts: unread messages, and ended sessions waiting on the member's outcome.
export const NAV_LINKS: NavLinkItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: svg(<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />) },
  { to: '/explore', label: 'Explore', icon: svg(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>) },
  { to: '/messages', label: 'Messages', countKey: 'messages', icon: svg(<path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />) },
  { to: '/sessions', label: 'Sessions', countKey: 'sessions', icon: svg(<><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M9 3.5v4M15 3.5v4" /></>) },
]

// The link's full spoken name with its count ("Messages, 2 unread", "Sessions, 1 to confirm").
export function countLabel(label: string, key: NavCountKey | undefined, count: number) {
  if (!key || count <= 0) return undefined
  return `${label}, ${count} ${key === 'messages' ? 'unread' : 'to confirm'}`
}
