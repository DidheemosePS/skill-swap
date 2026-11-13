import { Link } from 'react-router-dom'
import type { User } from '../../types'
import Avatar from '../common/Avatar'

// Who the thread is with and a way back to the list on phones. Face, name and headline together open the profile.
export default function ThreadHeader({ peer }: { peer: User }) {
  return (
    <header className="flex items-center gap-2 border-b border-line bg-surface px-3 py-3 sm:px-6">
      <Link to="/messages" aria-label="Back to messages" className="-ml-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent lg:hidden">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
      </Link>
      <Link to={`/user/${peer.id}`} className="group -my-1 flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <Avatar name={peer.name} url={peer.avatarUrl} size="sm" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold underline-offset-3 group-hover:underline">{peer.name}</h1>
          <p className="truncate text-sm text-muted">{peer.headline}<span className="sr-only">. View profile</span></p>
        </div>
      </Link>
    </header>
  )
}
