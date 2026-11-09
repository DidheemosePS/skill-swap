import type { SwapOffer } from './match'
import type { Review } from './session'
import type { User } from './user'

export interface ProfileReview extends Review {
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface MemberProfile extends SwapOffer {
  isSelf: boolean
  hasPendingRequest: boolean
  nextSessionAt: string | null
  reviews: ProfileReview[]
}
