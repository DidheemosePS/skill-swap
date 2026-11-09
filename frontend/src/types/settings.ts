import type { WeeklyAvailability } from './availability'
import type { SocialProvider, UserSkill } from './user'

// A sign-in method. Google and GitHub are the only ways to sign in, so at least one stays connected.
export interface ConnectedAccount {
  provider: SocialProvider
  // The name the provider shows, such as a GitHub username or a Google email.
  username: string
  url: string
  // The privacy control: whether the account is linked from the public profile.
  showOnProfile: boolean
}

// Everything the settings tabs edit, saved together by one save bar.
export interface ProfileSettings {
  name: string
  headline: string
  bio: string
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
  availability: WeeklyAvailability
  connectedAccounts: ConnectedAccount[]
}
