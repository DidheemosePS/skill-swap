import { useCurrentUser } from '../../hooks/useAuth'
import type { ProfileReview } from '../../types'
import Avatar from '../common/Avatar'
import { StarIcon } from '../common/icons'

interface ReviewCardProps {
  review: ProfileReview
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export default function ReviewCard({ review }: ReviewCardProps) {
  const isYours = useCurrentUser().id === review.author.id
  return (
    <article className="flex gap-3">
      <Avatar name={review.author.name} url={review.author.avatarUrl} size="sm" />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">
          {review.author.name}
          {/* Marked, so a member reading someone's reviews knows which ones are their own. */}
          {isYours && <span className="ml-1.5 font-medium text-muted">(you)</span>}
        </h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span role="img" aria-label={`Rated ${review.rating} out of 5`} className="inline-flex gap-px">
            {[1, 2, 3, 4, 5].map((star) => <StarIcon key={star} className={`size-3.5 ${star <= review.rating ? 'text-star' : 'text-line'}`} />)}
          </span>
          <span className="figures">{formatDate(review.createdAt)}</span>
          <span>Verified session</span>
        </p>
        <p className="mt-2 text-sm">{review.comment}</p>
      </div>
    </article>
  )
}
