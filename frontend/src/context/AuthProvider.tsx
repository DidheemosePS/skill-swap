import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import * as authService from '../services/authService'
import type { CurrentUser, SocialProvider } from '../types'
import { AuthContext } from './AuthContext'
import type { AuthStatus } from './AuthContext'

// Holds the signed-in member for the whole app. Pages read it through useAuth or useCurrentUser
// instead of importing the mock user, so the backend can supply it later without page changes.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // State only changes when the request settles, so the first load can run straight from an effect.
  const load = useCallback(() => {
    authService
      .fetchCurrentUser()
      .then((next) => {
        setUser(next)
        setStatus('ready')
      })
      .catch((cause) => {
        if (cause instanceof authService.UnauthorizedError) {
          setUser(null)
          setStatus('signed_out')
        } else {
          setStatus('error')
        }
      })
  }, [])

  // Status starts as loading, so the first load needs no state change of its own.
  useEffect(load, [load])

  // Keeps the current user during a refetch, so a refresh after saving settings doesn't blank the app.
  const refresh = useCallback(() => {
    setStatus('loading')
    load()
  }, [load])

  // For changes the client already knows the server made, such as finishing onboarding, so the
  // route guards see them at once without waiting for another fetch.
  const updateUser = useCallback((changes: Partial<CurrentUser>) => {
    setUser((current) => (current ? { ...current, ...changes } : current))
  }, [])

  // Both throw on failure, so the button that called them can show its own error.
  const signIn = useCallback(async (provider: SocialProvider) => {
    await authService.signIn(provider)
    refresh()
  }, [refresh])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
    setStatus('signed_out')
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, refresh, updateUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
