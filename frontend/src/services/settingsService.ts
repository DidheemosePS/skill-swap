import { mockConnectedAccounts, mockCurrentUser } from '../data/mockData'
import type { ConnectedAccount, ProfileSettings, SocialProvider } from '../types'
import { mockRequest } from './mockClient'

export const PROVIDER_NAMES: Record<SocialProvider, string> = { github: 'GitHub', google: 'Google' }

// Disconnecting the last sign-in method would lock the member out. Maps to a 409 from the real API.
export class LastAccountError extends Error {}

const readSettings = (): ProfileSettings =>
  structuredClone({
    name: mockCurrentUser.name,
    headline: mockCurrentUser.headline,
    bio: mockCurrentUser.bio,
    teachSkills: mockCurrentUser.teachSkills,
    learnSkills: mockCurrentUser.learnSkills,
    availability: mockCurrentUser.availability,
    connectedAccounts: mockConnectedAccounts,
  })

export function fetchSettings(): Promise<ProfileSettings> {
  return mockRequest('settings', readSettings())
}

// One save for all tabs. The real backend also recalculates the member's matches and open time blocks,
// while the mock's Explore and profile pages read the same user object, so they update straight away.
export async function saveSettings(settings: ProfileSettings): Promise<ProfileSettings> {
  await mockRequest('save-settings', null)
  const { connectedAccounts, ...profile } = structuredClone(settings)
  Object.assign(mockCurrentUser, profile)
  for (const account of mockConnectedAccounts) {
    account.showOnProfile = connectedAccounts.find((item) => item.provider === account.provider)?.showOnProfile ?? account.showOnProfile
  }
  mockCurrentUser.socialLinks = mockConnectedAccounts
    .filter((account) => account.showOnProfile)
    .map(({ provider, url }) => ({ provider, url }))
  return readSettings()
}

// Stands in for the OAuth round trip, which in the real app leaves the page and comes back.
export async function connectAccount(provider: SocialProvider): Promise<ConnectedAccount[]> {
  await mockRequest('connect-account', null)
  if (!mockConnectedAccounts.some((account) => account.provider === provider)) {
    const username = provider === 'google' ? 'alex.sample@example.com' : 'alex-sample'
    // A new account starts hidden, so connecting never publishes anything by surprise.
    mockConnectedAccounts.push({ provider, username, url: `https://example.com/${provider}/alex-sample`, showOnProfile: false })
  }
  return structuredClone(mockConnectedAccounts)
}

export async function disconnectAccount(provider: SocialProvider): Promise<ConnectedAccount[]> {
  await mockRequest('connect-account', null)
  const index = mockConnectedAccounts.findIndex((account) => account.provider === provider)
  if (index === -1) return structuredClone(mockConnectedAccounts)
  if (mockConnectedAccounts.length <= 1) throw new LastAccountError()
  mockConnectedAccounts.splice(index, 1)
  mockCurrentUser.socialLinks = mockCurrentUser.socialLinks.filter((link) => link.provider !== provider)
  return structuredClone(mockConnectedAccounts)
}
