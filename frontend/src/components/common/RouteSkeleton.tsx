import MessagesGuide from '../chat/MessagesGuide'
import Navbar from './Navbar'
import { DashboardSkeleton, ExploreSkeleton, ConversationRowsSkeleton, ProfileSkeleton, SessionsSkeleton, SettingsBodySkeleton, WalletSkeleton } from './pageSkeletons'
import Skeleton from './Skeleton'
import { PageTitle, ToggleLabels } from './skeletons'

const MAIN = 'mx-auto max-w-page px-4 py-6 sm:px-6 sm:py-8 lg:px-10'

// What a page looks like while it waits for data, drawn with the same pieces the page itself uses.
function Body({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/explore')) return <main className={MAIN}><PageTitle>Explore</PageTitle><ExploreSkeleton /></main>
  if (pathname.startsWith('/sessions')) return <main className={MAIN}><PageTitle>Sessions</PageTitle><SessionsSkeleton /></main>
  if (pathname.startsWith('/wallet')) return <main className={MAIN}><PageTitle>Wallet</PageTitle><WalletSkeleton /></main>
  if (pathname.startsWith('/settings')) return <main className={MAIN}><PageTitle>Settings</PageTitle><div className="mt-6"><SettingsBodySkeleton /></div></main>
  if (pathname.startsWith('/user/')) return <main className={MAIN}><ProfileSkeleton /></main>
  if (pathname.startsWith('/messages')) {
    return (
      <main className="grid h-[calc(100dvh-8.0625rem)] md:mx-auto md:h-[calc(100dvh-4rem)] md:w-full md:max-w-page md:px-6 md:py-6 lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] lg:px-10">
        <div className="bg-surface md:rounded-2xl md:border md:border-line lg:rounded-r-none">
          <p aria-hidden="true" className="px-4 pt-5 pb-3 font-display text-3xl font-semibold text-ink sm:text-4xl">Messages</p>
          <div aria-hidden="true" className="space-y-3 px-4 pb-2">
            <div className="flex min-h-11 items-center rounded-xl border border-line px-3 text-sm text-muted">Search people, skills or messages</div>
            <ToggleLabels labels={['All', 'Unread', 'Your turn']} />
          </div>
          <ConversationRowsSkeleton />
        </div>
        <div className="hidden overflow-hidden lg:block lg:rounded-r-2xl lg:border lg:border-l-0 lg:border-line"><MessagesGuide /></div>
      </main>
    )
  }
  return <main className={MAIN}><DashboardSkeleton /></main>
}

// The reload screen: the real app frame (sidebar or top bar, with account and balance as placeholders) around
// the same loading picture the page shows once it mounts, so a reload never flashes a different layout.
export default function RouteSkeleton({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/onboarding')) {
    return (
      <main role="status" aria-label="Loading" className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="mt-6 h-56 rounded-2xl" />
      </main>
    )
  }
  return (
    <div role="status" aria-label="Loading">
      <Navbar placeholder credits={null} heldCredits={null} counts={{ messages: 0 }} name="" avatarUrl={null} profileId="" />
      <Body pathname={pathname} />
    </div>
  )
}
