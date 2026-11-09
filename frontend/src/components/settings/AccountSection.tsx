import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { connectAccount, disconnectAccount, LastAccountError, PROVIDER_NAMES } from '../../services/settingsService'
import type { ConnectedAccount, SocialProvider } from '../../types'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'

interface AccountSectionProps {
  accounts: ConnectedAccount[]
  isDirty: boolean
  onToggle: (provider: SocialProvider, showOnProfile: boolean) => void
  onAccountsChange: (accounts: ConnectedAccount[]) => void
}

const PROVIDERS: SocialProvider[] = ['google', 'github']

export default function AccountSection({ accounts, isDirty, onToggle, onAccountsChange }: AccountSectionProps) {
  const { signOut } = useAuth()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(key: string, action: () => Promise<void>, failure: string) {
    setPending(key)
    setError(null)
    try {
      await action()
    } catch (cause) {
      setError(cause instanceof LastAccountError ? 'Keep at least one account connected, so you can still sign in.' : failure)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section aria-labelledby="accounts-heading">
        <h2 id="accounts-heading" className="font-semibold">Sign-in accounts</h2>
        <p className="mt-1 text-sm text-muted">You sign in with Google or GitHub. Keep at least one connected.</p>
        {error && <div className="mt-4"><AlertBanner message={error} /></div>}
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {PROVIDERS.map((provider) => {
            const account = accounts.find((item) => item.provider === provider)
            const name = PROVIDER_NAMES[provider]
            const isLast = accounts.length <= 1
            return (
              <li key={provider} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted [overflow-wrap:anywhere]">{account ? `Connected as ${account.username}` : 'Not connected'}</p>
                </div>
                {account ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                      {/* The privacy control: saved with the rest of the form, unlike connecting. */}
                      <input
                        type="checkbox"
                        role="switch"
                        checked={account.showOnProfile}
                        onChange={(event) => onToggle(provider, event.target.checked)}
                        className="size-4 accent-accent"
                      />
                      Show on my public profile
                    </label>
                    <Button
                      variant="secondary"
                      disabled={isLast || pending !== null}
                      isLoading={pending === `off-${provider}`}
                      title={isLast ? 'Connect another account first' : undefined}
                      onClick={() => run(`off-${provider}`, async () => onAccountsChange(await disconnectAccount(provider)), `We couldn't disconnect ${name}. Please try again.`)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  // Connecting leaves for the provider's sign-in page, which would drop unsaved edits.
                  <Button
                    variant="secondary"
                    disabled={isDirty || pending !== null}
                    isLoading={pending === `on-${provider}`}
                    onClick={() => run(`on-${provider}`, async () => onAccountsChange(await connectAccount(provider)), `We couldn't connect ${name}. Please try again.`)}
                  >
                    Connect {name}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
        {isDirty && accounts.length < PROVIDERS.length && (
          <p className="mt-2 text-sm text-muted">Save or discard your changes before connecting another account.</p>
        )}
      </section>

      <section aria-labelledby="signout-heading">
        <h2 id="signout-heading" className="font-semibold">Sign out</h2>
        <p className="mt-1 mb-3 text-sm text-muted">Signs you out on this device.</p>
        <Button
          variant="secondary"
          isLoading={pending === 'sign-out'}
          disabled={pending !== null}
          // AuthGate swaps in the sign-in panel once this resolves, so no navigation is needed.
          onClick={() => run('sign-out', signOut, "We couldn't sign you out. Please try again.")}
        >
          Sign out
        </Button>
      </section>
    </div>
  )
}
