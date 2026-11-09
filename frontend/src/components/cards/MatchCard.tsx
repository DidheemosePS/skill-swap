import { Link } from 'react-router-dom'
import type { MatchRecommendation, UserSkill } from '../../types'
import Avatar from '../common/Avatar'
import BookedSessionNote from '../common/BookedSessionNote'
import Button from '../common/Button'
import { getButtonClasses } from '../common/buttonStyles'
import SkillLine from '../common/SkillLine'
import StarRating from '../common/StarRating'

interface MatchCardProps {
  match: MatchRecommendation
  onRequest: (match: MatchRecommendation) => void
}

const namesFor = (skills: UserSkill[], ids: string[]) =>
  skills.filter(({ skill }) => ids.includes(skill.id)).map(({ skill }) => skill.name)

export default function MatchCard({ match, onRequest }: MatchCardProps) {
  const { peer } = match
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <Avatar name={peer.name} url={peer.avatarUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            <Link to={`/user/${peer.id}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
              {peer.name}
            </Link>
          </h3>
          <p className="text-sm text-muted">{peer.headline}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StarRating rating={peer.rating} reviewCount={peer.reviewCount} />
            {peer.isReliable && <span className="text-sm text-muted"><span aria-hidden="true">🛡️ </span>Reliable Swapper</span>}
          </div>
        </div>
        <p className="shrink-0 text-right text-xl font-semibold text-accent-strong">
          {match.score}%<span className="block text-xs font-medium text-muted">match</span>
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <SkillLine label="Teaches you" names={namesFor(peer.teachSkills, match.teachesYou)} />
        <SkillLine label="Learns from you" names={namesFor(peer.learnSkills, match.learnsFromYou)} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">{match.creditCost === 0 ? 'Free swap' : '1 credit'}</p>
          <BookedSessionNote startsAt={match.nextSessionAt} />
        </div>
        {match.hasPendingRequest ? (
          <Link to={`/messages?peer=${peer.id}`} className={getButtonClasses('secondary')}>Request pending</Link>
        ) : (
          <Button onClick={() => onRequest(match)}>Request Swap</Button>
        )}
      </div>
    </article>
  )
}
