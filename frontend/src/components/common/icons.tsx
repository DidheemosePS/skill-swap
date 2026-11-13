// Drawn icons, one stroke weight, in place of emoji and text glyphs that render differently on every OS.
interface IconProps {
  className?: string
}

export function StarIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.3 2.8 1-5.9-4.3-4.1 5.9-.8z" />
    </svg>
  )
}

export function ShieldIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.75 2.75 3.75v4c0 3.1 2.2 5.4 5.25 6.5 3.05-1.1 5.25-3.4 5.25-6.5v-4z" />
      <path d="m5.75 8 1.6 1.6 2.9-3.1" />
    </svg>
  )
}

export function GiftIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6h11v2.5h-11zM3.5 8.5v5h9v-5M8 6v7.5M8 6S6.75 2.75 5 3.25 5.5 6 8 6zm0 0s1.25-3.25 3-2.75S10.5 6 8 6z" />
    </svg>
  )
}

export function SidebarIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" />
      <path d="M6 2.75v10.5" />
    </svg>
  )
}
