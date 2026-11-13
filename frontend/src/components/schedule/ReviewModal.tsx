import { useState } from 'react'
import { SessionClosedError, submitReview } from '../../services/sessionActions'
import type { SessionDetail } from '../../types'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { formatSlotDay } from '../../utils/timeSlots'
import { StarIcon } from '../common/icons'
import { useToast } from '../../hooks/useToast'

interface ReviewModalProps {
  session: SessionDetail
  onClose: () => void
  onSubmitted: () => void
}

const MAX_COMMENT_LENGTH = 500
const STARS = [1, 2, 3, 4, 5]

export default function ReviewModal({ session, onClose, onSubmitted }: ReviewModalProps) {
  const firstName = session.partner.name.split(' ')[0]
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  async function submit() {
    setIsSubmitting(true)
    try {
      await submitReview(session.id, { rating, comment: comment.trim() })
      onSubmitted()
    } catch (cause) {
      toast.error(cause instanceof SessionClosedError ? "You've already reviewed this session." : "We couldn't save your review. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Modal // Named by skill and day, since the same partner can have several sessions waiting for a rating.
      title={`Rate ${session.skillName} with ${firstName}, ${formatSlotDay(session.startsAt)}`} onClose={onClose} isLocked={isSubmitting}>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-2 flex gap-1">
          {STARS.map((star) => (
            <label key={star} className={`flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors has-focus-visible:ring-2 has-focus-visible:ring-accent ${star <= rating ? 'text-star' : 'text-line hover:text-muted'}`}>
              <input type="radio" name="review-rating" checked={rating === star} onChange={() => setRating(star)} className="sr-only" aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`} />
              <StarIcon className="size-7" />
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 block text-sm font-medium">
        Comment (optional)
        <textarea
          value={comment}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder={`What was it like learning with ${firstName}?`}
          onChange={(event) => setComment(event.target.value)}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-base font-normal outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm"
        />
      </label>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Skip for now</Button>
        <Button onClick={submit} disabled={rating === 0} isLoading={isSubmitting}>Submit review</Button>
      </div>
    </Modal>
  )
}
