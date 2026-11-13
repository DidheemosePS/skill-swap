import { getToggleClasses } from './buttonStyles'
import Skeleton from './Skeleton'

// Loading pieces drawn in the shape of what replaces them (same card, padding, avatar and button sizes), so
// nothing jumps when the real content lands. Shared by each page's own loading state and by the reload screen.

const AVATAR = { xs: 'size-7', sm: 'size-9', lg: 'size-14', xl: 'size-20' }
const Circle = ({ size }: { size: keyof typeof AVATAR }) => <Skeleton className={`${AVATAR[size]} shrink-0 rounded-full`} />
// A button-sized pill in the white of a secondary button.
export const ButtonBone = ({ className = 'w-28' }: { className?: string }) => <div aria-hidden="true" className={`h-11 shrink-0 rounded-xl bg-surface lg:h-9 ${className}`} />

// A page title in its real words, so the heading never swaps from a bar to text.
export const PageTitle = ({ children }: { children: string }) => <p aria-hidden="true" className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{children}</p>

// A person card: Explore members and dashboard matches.
export function PersonCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-5">
      <div className="flex items-center gap-3.5">
        <Circle size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-52 max-w-full" />
        </div>
      </div>
      <div className="mt-4 flex h-12 items-center rounded-xl bg-surface px-3.5"><Skeleton className="h-3.5 w-48" /></div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <ButtonBone />
      </div>
    </div>
  )
}

export function PersonGridSkeleton({ count = 4, className = 'md:grid-cols-2 2xl:grid-cols-3' }: { count?: number; className?: string }) {
  return (
    <div className={`grid gap-5 ${className}`}>
      {Array.from({ length: count }, (_, index) => <PersonCardSkeleton key={index} />)}
    </div>
  )
}

// One row of a list: face, name, a line, and optionally its action. Inbox, conversations, history, ledger.
export function RowSkeleton({ avatar = 'sm', action = true, divided = true }: { avatar?: 'xs' | 'sm'; action?: boolean; divided?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-3.5 ${divided ? 'border-t border-line/70 first:border-t-0' : ''}`}>
      <Circle size={avatar} />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32 max-w-full" />
        <Skeleton className="h-3.5 w-56 max-w-full" />
      </div>
      {action && <ButtonBone />}
    </div>
  )
}

export function RowsSkeleton({ count = 3, ...row }: { count?: number; avatar?: 'xs' | 'sm'; action?: boolean }) {
  return <>{Array.from({ length: count }, (_, index) => <RowSkeleton key={index} {...row} />)}</>
}

// A session card on Sessions: date block, the swap pair, title and line, action.
export function AgendaCardSkeleton() {
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-card px-4 py-4 sm:px-5">
      <div className="flex w-12 flex-col items-center gap-1.5">
        <Skeleton className="h-2.5 w-8" />
        <Skeleton className="h-6 w-7" />
        <Skeleton className="h-2.5 w-9" />
      </div>
      <div className="flex"><Circle size="sm" /><span className="-ml-2"><Circle size="sm" /></span></div>
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-48 max-w-full" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <ButtonBone className="hidden w-32 sm:block" />
    </div>
  )
}

// The dark balance card on Wallet.
export function BalanceCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse rounded-3xl bg-next p-6 motion-reduce:animate-none sm:p-7">
      <div className="h-3.5 w-28 rounded-md bg-white/15" />
      <div className="mt-2.5 h-14 w-12 rounded-md bg-white/15" />
      <div className="mt-4 h-5 w-48 rounded-md bg-white/15" />
      <div className="mt-6 h-2 rounded-full bg-white/15" />
      <div className="mt-2 flex justify-between"><div className="h-4 w-16 rounded-md bg-white/15" /><div className="h-4 w-16 rounded-md bg-white/15" /></div>
    </div>
  )
}

// Two big figures and the hours bar: the dashboard's "Your time".
export function FiguresSkeleton() {
  return (
    <div className="mt-4 space-y-5">
      <div className="flex gap-8">
        <div className="space-y-2"><Skeleton className="h-9 w-8" /><Skeleton className="h-3.5 w-24" /></div>
        <div className="space-y-2"><Skeleton className="h-9 w-8" /><Skeleton className="h-3.5 w-24" /></div>
      </div>
      <Skeleton className="h-2 rounded-full" />
    </div>
  )
}

// A section heading and its one-line note.
export const SectionHeadSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-3.5 w-52" />
  </div>
)

// Toggles and tabs in their real words (first one selected), with no counts until the data says them.
export function ToggleLabels({ labels, vertical = false, className = '' }: { labels: string[]; vertical?: boolean; className?: string }) {
  return (
    <div aria-hidden="true" className={`flex gap-1 ${vertical ? 'lg:flex-col' : ''} ${className}`}>
      {labels.map((label, index) => <span key={label} className={getToggleClasses(index === 0, vertical ? 'text-left' : '')}>{label}</span>)}
    </div>
  )
}
