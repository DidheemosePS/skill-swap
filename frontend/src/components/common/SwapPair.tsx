import Avatar from './Avatar'

interface Person {
  name: string
  avatarUrl: string | null
}

interface SwapPairProps {
  me: Person
  partner: Person
  size?: 'xs' | 'sm' | 'md' | 'lg'
  // The ring matches the surface behind, so the overlap reads as a cut-out on dark cards as well as white.
  ringClass?: string
}

const MARK = { xs: 'size-4 -mx-1 [&_svg]:size-2.5', sm: 'size-5 -mx-1 [&_svg]:size-3', md: 'size-6 -mx-2 [&_svg]:size-3.5', lg: 'size-7 -mx-2 [&_svg]:size-4' }

// The product's signature: the two people in a swap, overlapped around a small exchange mark.
export default function SwapPair({ me, partner, size = 'sm', ringClass = 'ring-surface' }: SwapPairProps) {
  const ring = `rounded-full ${size === 'xs' ? 'ring-2' : 'ring-[3px]'} ${ringClass}`
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center">
      <span className={ring}><Avatar name={me.name} url={me.avatarUrl} size={size} /></span>
      <span className={`relative z-10 grid place-items-center rounded-full bg-white text-ink ${ring} ${MARK[size]}`}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />
        </svg>
      </span>
      <span className={ring}><Avatar name={partner.name} url={partner.avatarUrl} size={size} /></span>
    </span>
  )
}
