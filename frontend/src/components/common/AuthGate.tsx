import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AlertBanner from './AlertBanner'
import SignInPanel from './SignInPanel'
import Skeleton from './Skeleton'

// Decides what every route shows before its page: a loader, the sign-in panel, or a redirect that keeps
// members and onboarding in step. Pages behind it can rely on a signed-in, correctly onboarded member.
export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, status, refresh } = useAuth()
  const { pathname } = useLocation()
  const isOnboardingRoute = pathname === '/onboarding'

  // Only the first load blocks the app; later refetches keep the current member on screen.
  if (!user) {
    if (status === 'signed_out') return <SignInPanel />
    if (status === 'error') {
      return (
        <main className="mx-auto max-w-md px-4 py-16">
          <AlertBanner message="We couldn't load your account." onRetry={refresh} />
        </main>
      )
    }
    return (
      <div role="status" aria-label="Loading your account">
        <Skeleton className="h-16 rounded-none" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  // A new member finishes onboarding before anything else, and an onboarded one never sees it again.
  if (!user.isOnboarded && !isOnboardingRoute) return <Navigate to="/onboarding" replace />
  if (user.isOnboarded && isOnboardingRoute) return <Navigate to="/dashboard" replace />
  return children
}
