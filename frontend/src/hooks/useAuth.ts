import { use } from 'react'
import { AuthContext } from '../context/AuthContext'
import type { CurrentUser } from '../types'

export function useAuth() {
  const value = use(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

// For anything rendered behind AuthGate, where a member is always signed in.
export function useCurrentUser(): CurrentUser {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser must be used behind AuthGate')
  return user
}
