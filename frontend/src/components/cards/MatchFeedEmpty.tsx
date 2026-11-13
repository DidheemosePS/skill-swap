import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import { getButtonClasses } from '../common/buttonStyles'
import StateCard from '../common/StateCard'
import { EmptyMark } from '../common/stateIcons'

// The swap pair with the partner's seat still empty: the same motif as a real match, so the gap reads as
// "someone goes here" rather than as an error. One line and one way to go find them.
export default function MatchFeedEmpty({ kind }: { kind: 'free' | 'credit' }) {
  const me = useCurrentUser()
  const pair = (
    <>
      <span className="rounded-full ring-[3px] ring-card"><Avatar name={me.name} url={me.avatarUrl} size="sm" /></span>
      <span className="relative z-10 -mx-1 grid size-5 place-items-center rounded-full bg-white text-ink ring-[3px] ring-card">
        <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />
        </svg>
      </span>
      <EmptyMark icon="people" />
    </>
  )

  return (
    <div className="mt-4">
      <StateCard
        role="status"
        visual={pair}
        title={kind === 'free' ? 'No new free swaps yet' : 'No new credit matches yet'}
        action={<Link to="/explore" className={getButtonClasses('secondary', 'lg:min-h-9 lg:px-4')}>Explore members</Link>}
      />
    </div>
  )
}
