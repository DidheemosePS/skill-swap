import type { Review } from '../../types'
import { fromNow } from './time'
import { CURRENT_USER_ID as ALEX } from './users'

// Reviews between other members point at sessions outside the current user's list, which is
// expected: the session list only ever holds the current user's own sessions.
export const mockReviews: Review[] = [
  { id: 'review-1', sessionId: 'session-hana-done', authorId: 'user-hana', subjectId: ALEX, rating: 5, comment: 'Alex broke decorators down until they finally made sense.', createdAt: fromNow({ days: -24 }) },
  { id: 'review-2', sessionId: 'session-ivo-done', authorId: 'user-ivo', subjectId: ALEX, rating: 4, comment: 'Clear and patient. We fixed a real bug from my project.', createdAt: fromNow({ days: -14 }) },
  { id: 'review-3', sessionId: 'session-bea-spanish-done', authorId: ALEX, subjectId: 'user-bea', rating: 5, comment: 'Practical phrases I used the very next day.', createdAt: fromNow({ days: -19 }) },
  { id: 'review-4', sessionId: 'session-bea-done', authorId: ALEX, subjectId: 'user-bea', rating: 5, comment: 'Bea kept the whole hour in Spanish without it ever feeling hard.', createdAt: fromNow({ days: -5 }) },
  { id: 'review-5', sessionId: 'session-other-1', authorId: 'user-faye', subjectId: 'user-bea', rating: 5, comment: 'Patient with my accent and full of useful corrections.', createdAt: fromNow({ days: -12 }) },
  { id: 'review-6', sessionId: 'session-other-2', authorId: 'user-dina', subjectId: 'user-cole', rating: 5, comment: 'Cole reworked my slide layout live and explained every choice.', createdAt: fromNow({ days: -9 }) },
  { id: 'review-7', sessionId: 'session-other-3', authorId: 'user-gus', subjectId: 'user-cole', rating: 4, comment: 'Lots of good feedback, though we ran out of time at the end.', createdAt: fromNow({ days: -21 }) },
  { id: 'review-8', sessionId: 'session-other-4', authorId: 'user-cole', subjectId: 'user-dina', rating: 5, comment: 'My talk opening is finally clear. Dina spots filler instantly.', createdAt: fromNow({ days: -16 }) },
  { id: 'review-9', sessionId: 'session-other-5', authorId: 'user-bea', subjectId: 'user-faye', rating: 5, comment: 'Faye turned a cluttered screen into something calm in an hour.', createdAt: fromNow({ days: -6 }) },
  { id: 'review-10', sessionId: 'session-other-6', authorId: 'user-ivo', subjectId: 'user-evan', rating: 4, comment: 'Good travel French. I would have liked more speaking practice.', createdAt: fromNow({ days: -27 }) },
  { id: 'review-11', sessionId: 'session-other-7', authorId: 'user-hana', subjectId: 'user-gus', rating: 4, comment: 'Gus cut my portfolio copy in half and it reads far better.', createdAt: fromNow({ days: -33 }) },
  { id: 'review-12', sessionId: 'session-other-8', authorId: 'user-evan', subjectId: 'user-hana', rating: 5, comment: 'I learned more about window light in an hour than in a year alone.', createdAt: fromNow({ days: -11 }) },
  { id: 'review-13', sessionId: 'session-other-9', authorId: 'user-gus', subjectId: 'user-ivo', rating: 4, comment: 'I played my first full song by the end of the hour.', createdAt: fromNow({ days: -18 }) },
]
