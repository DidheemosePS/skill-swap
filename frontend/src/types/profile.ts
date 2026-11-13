import type { WeeklyAvailability } from './availability'
import type { SwapOffer } from './match'
import type { Session } from './session'
import type { Review } from './session'
import type { User } from './user'

export interface ProfileReview extends Review {
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface MemberProfile extends SwapOffer {
  isSelf: boolean
  hasPendingRequest: boolean
  nextSessionAt: string | null
  // The same session in full, so the profile can count down to it and offer Join once it opens.
  nextSession: Pick<Session, 'id' | 'startsAt' | 'durationMinutes' | 'meetingUrl'> | null
  reviews: ProfileReview[]
  // The viewer's own weekly hours, so the profile can show when the two of them are both free.
  // Null on the viewer's own profile.
  viewerAvailability: WeeklyAvailability | null
}
