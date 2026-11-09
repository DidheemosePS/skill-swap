import type { ProfileReview } from '../../types'
import Avatar from '../common/Avatar'

interface ReviewCardProps {
  review: ProfileReview
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="flex gap-3">
      <Avatar name={review.author.name} url={review.author.avatarUrl} size="sm" />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{review.author.name}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span role="img" aria-label={`Rated ${review.rating} out of 5`} className="text-sm text-star">
            {'★'.repeat(review.rating)}
            <span className="text-line">{'★'.repeat(5 - review.rating)}</span>
          </span>
          <span>{formatDate(review.createdAt)}</span>
          <span>Verified session</span>
        </p>
        <p className="mt-2 text-sm">{review.comment}</p>
      </div>
    </article>
  )
}
