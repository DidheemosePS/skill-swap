interface StarRatingProps {
  rating: number
  reviewCount: number
}

export default function StarRating({ rating, reviewCount }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span aria-hidden="true" className="text-star">★</span>
      <span className="font-medium">{rating.toFixed(1)}</span>
      <span className="text-muted">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
    </span>
  )
}
