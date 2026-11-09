import type { WeeklyAvailability } from './availability'
import type { UserSkill } from './user'
import type { Wallet } from './wallet'

export interface OnboardingPayload {
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
  availability: WeeklyAvailability
}

export interface OnboardingResult {
  isOnboarded: true
  wallet: Wallet
}
