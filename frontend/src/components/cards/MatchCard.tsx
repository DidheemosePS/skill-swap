import { Link } from 'react-router-dom'
import type { MatchRecommendation, UserSkill } from '../../types'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import StarRating from '../common/StarRating'

interface MatchCardProps {
  match: MatchRecommendation
  onRequest: (match: MatchRecommendation) => void
  // Only one card per page gets the filled button, so there's one obvious next step.
  isPrimary?: boolean
}

const namesFor = (skills: UserSkill[], ids: string[]) =>
  skills.filter(({ skill }) => ids.includes(skill.id)).map(({ skill }) => skill.name)

// A person to swap with: their face and line, then the trade in one sentence on a soft panel, then one action.
// The deal is said in words ("they want your Python", "1 credit") rather than a coloured tag.
export default function MatchCard({ match, onRequest, isPrimary = false }: MatchCardProps) {
  const { peer } = match
  const firstName = peer.name.split(' ')[0]
  const isPaid = match.creditCost === 1
  const learn = namesFor(peer.teachSkills, match.teachesYou)
  const teach = namesFor(peer.learnSkills, match.learnsFromYou)

  return (
    <article className="flex h-full flex-col rounded-2xl bg-card p-5">
      <div className="flex items-center gap-3.5">
        <Avatar name={peer.name} url={peer.avatarUrl} size="lg" />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-ink">
            <Link to={`/user/${peer.id}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{peer.name}</Link>
          </h3>
          <p className="text-sm text-pretty text-muted [overflow-wrap:anywhere]">{peer.headline}</p>
        </div>
      </div>
      <p className="mt-4 rounded-xl bg-surface px-3.5 py-3 text-sm text-ink">
        You learn <b className="font-semibold">{learn.join(', ')}</b>
        <span className="text-muted"> · {isPaid ? '1 credit an hour' : <>they want your <b className="font-semibold text-ink">{teach.join(', ')}</b></>}</span>
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <StarRating rating={peer.rating} reviewCount={peer.reviewCount} completedSessions={peer.completedSessions} />
        <Button
          variant={isPrimary ? 'primary' : 'secondary'}
          onClick={() => onRequest(match)}
          // Starts with the visible label, so voice control ("click Book") still finds it.
          aria-label={isPaid ? `Book, 1 credit, session with ${firstName}` : `Request swap with ${firstName}`}
          className="lg:min-h-9 lg:px-4"
        >
          {isPaid ? 'Book' : 'Request swap'}
        </Button>
      </div>
    </article>
  )
}
