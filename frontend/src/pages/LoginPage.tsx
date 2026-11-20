import { Navigate, useLocation } from 'react-router-dom'
import BrandMark from '../components/common/BrandMark'
import SignInPanel from '../components/common/SignInPanel'
import Skeleton from '../components/common/Skeleton'
import { useAuth } from '../hooks/useAuth'

// The form's shape while the session check runs, so someone already signed in never
// sees a login form flash before their redirect — the swap is skeleton to app.
function LoginSkeleton() {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-4 py-20 sm:px-8">
      <div className="absolute top-6 left-4 sm:left-8">
        <BrandMark />
      </div>
      <div className="mx-auto w-full max-w-sm">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="mt-6 h-9 w-56" />
        <Skeleton className="mt-3 h-5 w-72" />
        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </main>
  )
}

// The dedicated sign-in route. A visitor sees the panel; someone already signed in is
// sent on immediately — back to the private page they were trying to open (AuthGate
// passes it in router state) or to their home base. Signing in updates the auth
// context, which re-renders this page into that same redirect, so the return trip
// needs no extra wiring in the panel itself.
export default function LoginPage() {
  const { user, status } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (user) return <Navigate to={from ?? (user.isOnboarded ? '/dashboard' : '/onboarding')} replace />
  if (status === 'loading') return <LoginSkeleton />
  // signed_out shows the form; so does error, since signing in is also the retry.
  return <SignInPanel />
}
