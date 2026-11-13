import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import type { DirectoryMember, UserSkill } from '../../types'
import { skillNameKey } from '../../utils/skills'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import { getButtonClasses } from '../common/buttonStyles'
import ReliableBadge from '../common/ReliableBadge'
import StarRating from '../common/StarRating'
import SwapPair from '../common/SwapPair'

interface MemberCardProps {
  member: DirectoryMember
  // The searched skill, so the card names it when this member teaches it.
  search: string
  onBook: (member: DirectoryMember) => void
}

// The skills that make the deal: shared ones first, else the searched one, else their first listed.
function pick(skills: UserSkill[], ids: string[], search = '') {
  const key = skillNameKey(search)
  const shared = skills.filter(({ skill }) => ids.includes(skill.id) || (key !== '' && skillNameKey(skill.name).includes(key)))
  return (shared.length > 0 ? shared : skills.slice(0, 1)).map(({ skill }) => skill.name).join(', ')
}

const button = getButtonClasses('secondary', 'lg:min-h-9 lg:px-4')

// A person on Explore: face and line (which open their profile), then the trade in one sentence, then the one
// thing to do next. A free swap shows both of you around the swap mark; a credit lesson says its price in words.
// The button always says what it does: Book a session, Book another (with the booked one named above it), or
// View request when one is already open between you.
export default function MemberCard({ member, search, onBook }: MemberCardProps) {
  const me = useCurrentUser()
  const { user, deal, hasPendingRequest, nextSessionAt, teachesYou, learnsFromYou } = member
  const firstName = user.name.split(' ')[0]
  const theirs = pick(user.teachSkills, teachesYou, search)

  return (
    <li className="flex flex-col rounded-2xl bg-card p-5">
      <Link to={`/user/${user.id}`} className="group -m-1.5 flex items-center gap-3.5 rounded-xl p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <Avatar name={user.name} url={user.avatarUrl} size="lg" />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink underline-offset-3 group-hover:underline">{user.name}</h3>
          <span className="block text-sm text-pretty text-muted">{user.headline}</span>
        </div>
      </Link>
      {deal === 'free' ? (
        <p className="mt-4 flex items-center gap-3 rounded-xl bg-surface px-3.5 py-3 text-sm text-ink">
          <SwapPair me={me} partner={user} size="xs" ringClass="ring-surface" />
          <span>Your <b className="font-semibold">{pick(user.learnSkills, learnsFromYou)}</b> for their <b className="font-semibold">{theirs}</b></span>
        </p>
      ) : (
        <p className="mt-4 rounded-xl bg-surface px-3.5 py-3 text-sm text-ink">Learn <b className="font-semibold">{theirs}</b> for 1 credit an hour</p>
      )}
      {nextSessionAt && !hasPendingRequest && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 13 5v6.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5V5ZM3 7h10M6 2v3M10 2v3" />
          </svg>
          <span>Booked <span className="figures font-medium text-ink">{formatSlotDateTime(nextSessionAt)}</span>. <Link to="/sessions" className="rounded font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">See it</Link></span>
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-4">
        <span className="flex flex-wrap items-center gap-x-3">
          <StarRating rating={user.rating} reviewCount={user.reviewCount} completedSessions={user.completedSessions} />
          {user.isReliable && <ReliableBadge />}
        </span>
        {hasPendingRequest ? (
          <Link to={`/messages?peer=${user.id}`} className={button}>View request<span className="sr-only"> with {firstName}</span></Link>
        ) : (
          <button type="button" onClick={() => onBook(member)} className={button}>
            {nextSessionAt ? 'Book another' : 'Book a session'}<span className="sr-only"> with {firstName}</span>
          </button>
        )}
      </div>
    </li>
  )
}
