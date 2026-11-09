import type { WeeklyAvailability } from './availability'

export type Proficiency = 'beginner' | 'intermediate' | 'expert'

export type SocialProvider = 'github' | 'google'

export interface Skill {
  id: string
  name: string
  category: string
  // True when the member typed this skill; the backend assigns the real ID on save.
  isCustom?: boolean
}

// For a teach skill, proficiency is the current level; for a learn skill, the target level.
export interface UserSkill {
  skill: Skill
  proficiency: Proficiency
}

export interface SocialLink {
  provider: SocialProvider
  url: string
}

export interface User {
  id: string
  name: string
  // Null means the UI should fall back to initials.
  avatarUrl: string | null
  headline: string
  bio: string
  isOnboarded: boolean
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
  availability: WeeklyAvailability
  socialLinks: SocialLink[]
  // Aggregates are computed by the backend, so they can cover more reviews than a page loads.
  rating: number
  reviewCount: number
  completedSessions: number
  isReliable: boolean
  lastActiveAt: string
}

// The signed-in member as GET /users/me returns it: just what the shell and route guards need.
export type CurrentUser = Pick<User, 'id' | 'name' | 'avatarUrl' | 'isOnboarded'>
