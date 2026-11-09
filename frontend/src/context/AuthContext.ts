import { createContext } from 'react'
import type { CurrentUser, SocialProvider } from '../types'

// signed_out is its own state, not an error: it shows the sign-in panel instead of a retry banner.
export type AuthStatus = 'loading' | 'ready' | 'signed_out' | 'error'

export interface AuthContextValue {
  user: CurrentUser | null
  status: AuthStatus
  refresh: () => void
  updateUser: (changes: Partial<CurrentUser>) => void
  signIn: (provider: SocialProvider) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
