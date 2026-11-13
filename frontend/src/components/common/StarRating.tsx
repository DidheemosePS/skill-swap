import { MIN_REVIEWS_FOR_RATING } from '../../utils/ratings'
import { StarIcon } from './icons'

interface StarRatingProps {
  rating: number
  reviewCount: number
  // Below the review threshold, someone with sessions reads "Not rated yet", not "New member".
  completedSessions?: number
}


export default function StarRating({ rating, reviewCount, completedSessions = 0 }: StarRatingProps) {
  if (reviewCount < MIN_REVIEWS_FOR_RATING) {
    return (
      <span className="text-sm font-medium text-muted">
        {completedSessions > 0 ? <>Not rated yet · <span className="figures">{reviewCount}</span> of <span className="figures">{MIN_REVIEWS_FOR_RATING}</span> reviews</> : 'New member'}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="sr-only">Rated {rating.toFixed(1)} out of 5 from {reviewCount} reviews</span>
      <StarIcon className="size-4 text-star" />
      <span aria-hidden="true" className="figures font-semibold">{rating.toFixed(1)}</span>
      <span aria-hidden="true" className="text-muted">(<span className="figures">{reviewCount}</span> reviews)</span>
    </span>
  )
}
