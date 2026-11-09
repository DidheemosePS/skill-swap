import { mockCurrentUser } from '../data/mockData'
import type { CurrentUser, SocialProvider } from '../types'
import { isMockEmpty, mockRequest } from './mockClient'

// No valid session. Maps to a 401 from the real API, and shows the sign-in panel rather than an error.
export class UnauthorizedError extends Error {}

// Stands in for the session cookie. It lives in memory, so a browser refresh signs the mock back in.
let isSignedIn = true

// VITE_MOCK_EMPTY=me starts Alex as a brand-new member, so onboarding can be tried. It's set on the
// shared user, not per response, so finishing onboarding sticks for the rest of the visit.
if (isMockEmpty('me')) mockCurrentUser.isOnboarded = false

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const { id, name, avatarUrl, isOnboarded } = mockCurrentUser
  const user = await mockRequest('me', { id, name, avatarUrl, isOnboarded })
  if (!isSignedIn) throw new UnauthorizedError()
  return user
}

// The real app sends the browser to GET /auth/{provider}/login, and the OAuth callback returns it to
// the same URL with a session cookie. The mock skips the round trip.
export async function signIn(_provider: SocialProvider): Promise<void> {
  await mockRequest('sign-in', null)
  isSignedIn = true
}

export async function signOut(): Promise<void> {
  await mockRequest('sign-out', null)
  isSignedIn = false
}
