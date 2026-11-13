import { useState } from 'react'
import { useAuth, useCurrentUser } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { connectAccount, disconnectAccount, LastAccountError, PROVIDER_NAMES } from '../../services/settingsService'
import type { ConnectedAccount, SocialProvider } from '../../types'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import ProviderIcon from '../common/ProviderIcon'
import Switch from '../common/Switch'
import SettingsPanel from './SettingsPanel'

interface AccountSectionProps {
  accounts: ConnectedAccount[]
  isDirty: boolean
  onToggle: (provider: SocialProvider, showOnProfile: boolean) => void
  onAccountsChange: (accounts: ConnectedAccount[]) => void
}

const PROVIDERS: SocialProvider[] = ['google', 'github']

// The provider's mark in a white tile, as sign-in settings show it everywhere.
const Mark = ({ provider }: { provider: SocialProvider }) => (
  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface"><ProviderIcon provider={provider} /></span>
)

// Three plain questions: how do I sign in, what do members see, and am I signed in here.
export default function AccountSection({ accounts, isDirty, onToggle, onAccountsChange }: AccountSectionProps) {
  const { signOut } = useAuth()
  const me = useCurrentUser()
  const toast = useToast()
  const [pending, setPending] = useState<string | null>(null)
  // A GitHub page is a public profile worth linking; a Google account is only an email, so it never is.
  const linkable = accounts.filter((account) => account.provider === 'github')

  async function run(key: string, action: () => Promise<void>, failure: string, success?: string) {
    setPending(key)
    try {
      await action()
      if (success) toast.success(success)
    } catch (cause) {
      toast.error(cause instanceof LastAccountError ? 'Keep one account so you can sign in.' : failure)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-6">
      <SettingsPanel id="accounts-heading" title="Sign-in methods" hint="Sign in with any of these. Keep at least one.">
        <ul className="-my-3 divide-y divide-line/60">
          {PROVIDERS.map((provider) => {
            const account = accounts.find((item) => item.provider === provider)
            const name = PROVIDER_NAMES[provider]
            const isLast = accounts.length <= 1
            return (
              <li key={provider} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5">
                <Mark provider={provider} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{name}</p>
                  <p className="text-sm break-words text-muted">
                    {account ? (
                      <><span className="mr-1.5 inline-block size-2 rounded-full bg-success align-middle" aria-hidden="true" />Connected · <span className="whitespace-nowrap">{account.username}</span></>
                    ) : 'Not connected'}
                  </p>
                </div>
                {account ? (
                  <Button
                      variant="secondary"
                      disabled={isLast || pending !== null}
                      isLoading={pending === `off-${provider}`}
                      className="lg:min-h-9 lg:px-4"
                      onClick={() => run(`off-${provider}`, async () => onAccountsChange(await disconnectAccount(provider)), `Couldn't disconnect ${name}. Try again.`, `${name} disconnected.`)}
                    >
                      Disconnect
                    </Button>
                ) : (
                  // Connecting leaves for the provider's sign-in page, which would drop unsaved edits.
                  <Button
                    variant="secondary"
                    disabled={isDirty || pending !== null}
                    isLoading={pending === `on-${provider}`}
                    className="lg:min-h-9 lg:px-4"
                    onClick={() => run(`on-${provider}`, async () => onAccountsChange(await connectAccount(provider)), `Couldn't connect ${name}. Try again.`, `${name} connected. You can sign in with it now.`)}
                  >
                    <ProviderIcon provider={provider} className="size-4" />
                    Connect
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
        {isDirty && accounts.length < PROVIDERS.length && <p className="mt-3 text-sm text-muted">Save or discard your changes before connecting.</p>}
      </SettingsPanel>

      {linkable.length > 0 && (
        <SettingsPanel id="links-heading" title="On your profile" hint="Links members see under your name.">
          <ul className="-my-3 divide-y divide-line/60">
            {linkable.map((account) => (
              <li key={account.provider} className="flex items-center gap-4 py-3.5">
                <Mark provider={account.provider} />
                <div className="min-w-0 flex-1">
                  <p id={`link-${account.provider}`} className="font-medium text-ink">Show my {PROVIDER_NAMES[account.provider]}</p>
                  <p id={`link-${account.provider}-note`} className="text-sm text-pretty text-muted">
                    Adds a link to {account.username} on your profile, so members can see your work. Saved with your changes.
                  </p>
                </div>
                <Switch checked={account.showOnProfile} onChange={(on) => onToggle(account.provider, on)} labelledBy={`link-${account.provider}`} describedBy={`link-${account.provider}-note`} />
              </li>
            ))}
          </ul>
        </SettingsPanel>
      )}

      <SettingsPanel id="session-heading" title="Signed in">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <Avatar name={me.name} url={me.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">{me.name}</p>
            <p className="text-sm text-muted">On this device · you stay signed in until you sign out</p>
          </div>
          <Button
            variant="secondary"
            isLoading={pending === 'sign-out'}
            disabled={pending !== null}
            className="lg:min-h-9 lg:px-4"
            // AuthGate swaps in the sign-in page once this resolves, so no navigation is needed.
            onClick={() => run('sign-out', signOut, "Couldn't sign you out. Try again.")}
          >
            Sign out
          </Button>
        </div>
      </SettingsPanel>
    </div>
  )
}
