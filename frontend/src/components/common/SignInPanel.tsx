import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { PROVIDER_NAMES } from '../../services/settingsService'
import type { SocialProvider } from '../../types'
import BrandMark from './BrandMark'
import ProviderIcon from './ProviderIcon'

const PROVIDERS: SocialProvider[] = ['google', 'github']

// Shown by AuthGate in place of any page while signed out, so it needs no route of its own. Signing in reloads
// the member, and the gate then shows the page at the same URL. The two provider buttons look the way those
// buttons look everywhere: white, the provider's own mark, "Continue with".
export default function SignInPanel() {
  const { signIn } = useAuth()
  const [pending, setPending] = useState<SocialProvider | null>(null)
  const toast = useToast()

  async function handleSignIn(provider: SocialProvider) {
    setPending(provider)
    try {
      await signIn(provider)
    } catch {
      toast.error("We couldn't sign you in. Please try again.")
      setPending(null)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <title>Sign in · Skill Swap</title>
      <BrandMark />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        {/* The logo's two circles, large: the swap is the whole idea, so it is the one picture on the page. */}
        <svg aria-hidden="true" viewBox="0 0 64 40" className="h-10 w-16 text-ink">
          <circle cx="20" cy="20" r="18" fill="currentColor" />
          <circle cx="44" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
        <h1 className="mt-6 text-3xl font-semibold text-balance text-ink">Sign in to Skill Swap</h1>
        <p className="mt-2 text-pretty text-muted">Teach what you know, learn what you don't. One hour at a time.</p>

        <div className="mt-8 flex flex-col gap-3">
          {PROVIDERS.map((provider) => (
            <button
              key={provider}
              type="button"
              disabled={pending !== null}
              aria-busy={pending === provider}
              onClick={() => handleSignIn(provider)}
              className="relative inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-ink outline-none transition hover:border-muted hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
            >
              <span className="absolute left-4"><ProviderIcon provider={provider} /></span>
              {pending === provider ? 'Signing in…' : `Continue with ${PROVIDER_NAMES[provider]}`}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-pretty text-muted">New here? Signing in creates your account, and your first credit is on us.</p>
      </div>
    </main>
  )
}
