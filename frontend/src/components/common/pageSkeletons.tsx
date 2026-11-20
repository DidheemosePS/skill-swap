import { CreditRules } from '../wallet/WalletSummary'
import { getButtonClasses } from './buttonStyles'
import Skeleton from './Skeleton'
import {
  AgendaCardSkeleton, BalanceCardSkeleton, PersonGridSkeleton, RowsSkeleton, SectionHeadSkeleton, ToggleLabels,
} from './skeletons'

// What each page shows under its title while its first data loads. The pages render these themselves, and the
// reload screen (AuthGate) renders the same ones, so a reload and an in-app visit wait on one identical picture.

const linkText = 'text-sm font-medium text-accent-strong'

// Card shells that match the real dashboard board: index cards in the board's colours.
const CardHead = ({ title, link }: { title: string; link: string }) => (
  <div aria-hidden="true" className="flex min-h-9 items-center justify-between"><p className="font-display text-lg font-semibold text-ink">{title}</p><span className={linkText}>{link}</span></div>
)
export const ComingUpBody = () => <div className="mt-1"><RowsSkeleton count={2} avatar="xs" action={false} /></div>

export function DashboardSkeleton() {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3"><Skeleton className="h-10 w-80 max-w-full" /><Skeleton className="h-4 w-56 max-w-full" /></div>
        <span aria-hidden="true" className={getButtonClasses('primary', 'max-sm:hidden')}>Find a swap</span>
      </div>
      <div className="mt-6 flex flex-col gap-5 xl:grid xl:grid-cols-12 xl:items-start">
        <div className="space-y-4 rounded-2xl bg-sun/60 p-6 xl:col-span-4"><Skeleton className="h-9 w-56" /><Skeleton className="h-5 w-48" /><Skeleton className="h-11 w-40" /></div>
        <div className="flex flex-col gap-5 xl:col-span-5">
          {[0, 1].map((key) => (
            <div key={key} className="space-y-3 rounded-2xl bg-coral-soft p-5"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-11 w-32" /></div>
          ))}
        </div>
        <div className="flex flex-col gap-5 xl:col-span-3">
          <div className="rounded-2xl border-2 border-dashed border-accent bg-surface p-5"><CardHead title="Your time" link="Wallet" /><Skeleton className="mt-3 h-8 w-44" /><Skeleton className="mt-3 h-4 w-full" /></div>
          <div className="rounded-2xl border border-line bg-card p-5 pb-2"><CardHead title="Coming up" link="All" /><ComingUpBody /></div>
        </div>
      </div>
      <div className="mt-10">
        <div aria-hidden="true" className="flex flex-wrap items-center justify-between gap-2"><p className="font-display text-lg font-semibold text-ink">People to swap with</p><ToggleLabels labels={['Free swaps', 'With a credit']} /></div>
        <div className="mt-4"><PersonGridSkeleton count={3} className="md:grid-cols-2 xl:grid-cols-3" /></div>
      </div>
    </>
  )
}

// Explore below its search and toggles: the count line, then the first section of people.
export function ExploreResultsSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-40 lg:h-9" /></div>
      <div className="mt-6"><SectionHeadSkeleton /></div>
      <div className="mt-4"><PersonGridSkeleton count={4} /></div>
    </div>
  )
}

export function ExploreSkeleton() {
  return (
    <>
      <p aria-hidden="true" className="mt-1 text-sm text-muted">Find someone to swap with.</p>
      <div aria-hidden="true" className="mt-5 flex min-h-11 items-center gap-2.5 rounded-lg border border-line px-3.5 text-sm text-muted">
        <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="6" /><path d="m14 14 4 4" /></svg>
        <span className="truncate">Search what you want to learn, like Python</span>
      </div>
      <div aria-hidden="true" className="mt-4 flex items-center justify-between">
        <ToggleLabels labels={['All', 'Free swap', 'With a credit']} />
        <span className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm font-medium lg:min-h-9">Filters</span>
      </div>
      <div className="mt-4"><ExploreResultsSkeleton /></div>
    </>
  )
}

export const ConversationRowsSkeleton = () => <div className="px-3"><RowsSkeleton count={5} action={false} /></div>

export function SessionsSkeleton() {
  return (
    <>
      <Skeleton className="mt-2.5 h-4 w-40" />
      <p aria-hidden="true" className="mt-8 font-display text-xl font-semibold text-ink">Settling</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[0, 1].map((key) => (
          <div key={key} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex gap-3.5"><Skeleton className="size-9 shrink-0 rounded-full" /><div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3.5 w-1/2" /></div></div>
            <Skeleton className="mt-4 h-11 w-36 rounded-xl lg:h-9" />
          </div>
        ))}
      </div>
      <p aria-hidden="true" className="mt-10 font-display text-xl font-semibold text-ink">Coming up</p>
      <div className="mt-4 space-y-3">{[0, 1, 2].map((key) => <AgendaCardSkeleton key={key} />)}</div>
    </>
  )
}

export const LedgerRowsSkeleton = () => <div className="px-4 sm:px-6"><RowsSkeleton count={5} action={false} /></div>

export function WalletSkeleton() {
  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
      <div className="grid gap-5 lg:col-span-5 lg:col-start-8 lg:row-start-1 xl:col-span-4 xl:col-start-9"><BalanceCardSkeleton /><CreditRules /></div>
      <div className="rounded-2xl border border-line bg-card lg:col-span-7 lg:col-start-1 lg:row-start-1 xl:col-span-8">
        <ToggleLabels labels={['All', 'Earned', 'Spent', 'Held']} className="border-b border-line px-4 py-3 sm:px-6" />
        <LedgerRowsSkeleton />
      </div>
    </div>
  )
}

export const SettingsBodySkeleton = () => (
  <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start lg:gap-8">
    <ToggleLabels labels={['Profile', 'Skills', 'Availability', 'Account']} vertical />
    <div className="mt-5 space-y-5 rounded-2xl border border-line bg-card p-5 lg:mt-0">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="size-20 rounded-full" />
      {[0, 1].map((key) => <div key={key} className="space-y-2"><Skeleton className="h-4 w-20" /><div className="h-11 rounded-lg bg-surface" /></div>)}
    </div>
  </div>
)

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2.5"><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-72 max-w-full" /><Skeleton className="h-3.5 w-48" /></div>
      </div>
      {/* The exchange note is the dark card, so it waits in its own colour. */}
      <div aria-hidden="true" className="h-28 animate-pulse rounded-3xl bg-next motion-reduce:animate-none" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {[0, 1].map((key) => (
          <div key={key} className="rounded-xl border border-line bg-card">
            <div className="border-b border-line px-5 py-3.5"><Skeleton className="h-4 w-28" /></div>
            <div className="space-y-2.5 p-5"><Skeleton className="h-3.5" /><Skeleton className="h-3.5 w-5/6" /><Skeleton className="h-3.5 w-2/3" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
