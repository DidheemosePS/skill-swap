import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { PROVIDER_NAMES } from '../../services/settingsService'
import type { SocialProvider } from '../../types'
import AlertBanner from './AlertBanner'
import Button from './Button'

const PROVIDERS: SocialProvider[] = ['google', 'github']

// Shown by AuthGate in place of any page while signed out, so it needs no route of its own.
// Signing in reloads the member, and the gate then shows the page at the same URL.
export default function SignInPanel() {
  const { signIn } = useAuth()
  const [pending, setPending] = useState<SocialProvider | null>(null)
  const [error, setError] = useState(false)

  async function handleSignIn(provider: SocialProvider) {
    setPending(provider)
    setError(false)
    try {
      await signIn(provider)
    } catch {
      setError(true)
      setPending(null)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <title>Sign in · Skill Swap</title>
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6">
        <p className="font-semibold">Skill Swap</p>
        <h1 className="mt-6 text-2xl font-semibold text-balance">Sign in to keep swapping</h1>
        <p className="mt-2 text-sm text-muted">Teach what you know and learn what you don't, one hour at a time.</p>
        {error && (
          <div className="mt-5">
            <AlertBanner message="We couldn't sign you in. Please try again." />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-2">
          {PROVIDERS.map((provider) => (
            <Button
              key={provider}
              variant={provider === 'google' ? 'primary' : 'secondary'}
              isLoading={pending === provider}
              disabled={pending !== null}
              onClick={() => handleSignIn(provider)}
            >
              Continue with {PROVIDER_NAMES[provider]}
            </Button>
          ))}
        </div>
      </div>
    </main>
  )
}
