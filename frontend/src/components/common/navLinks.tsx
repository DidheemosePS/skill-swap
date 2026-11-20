import type { ReactNode } from 'react'

export type NavCountKey = 'messages'

export interface NavLinkItem {
  to: string
  label: string
  icon: ReactNode
  countKey?: NavCountKey
}

const svg = (path: ReactNode) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
)

// The four places, shared by the desktop links and the phone tabs so they can't drift apart. Messages carries
// the unread count. Sessions has none: ended sessions settle on their own, so nothing there is owed.
export const NAV_LINKS: NavLinkItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: svg(<path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />) },
  { to: '/explore', label: 'Explore', icon: svg(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>) },
  { to: '/messages', label: 'Messages', countKey: 'messages', icon: svg(<path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />) },
  { to: '/sessions', label: 'Sessions', icon: svg(<><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M9 3.5v4M15 3.5v4" /></>) },
]

// What a count means in words ("2 unread"). Expanded links say it as screen-reader text
// after their visible label, so the spoken name starts with what's on screen; the icon-only rail and
// its tooltip use the whole phrase ("Messages, 2 unread").
export function countWords(key: NavCountKey | undefined, count: number) {
  if (!key || count <= 0) return undefined
  return `${count} unread`
}

export function countLabel(label: string, key: NavCountKey | undefined, count: number) {
  const words = countWords(key, count)
  return words && `${label}, ${words}`
}
