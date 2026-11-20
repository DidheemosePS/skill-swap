import { mockCurrentUser } from '../data/mockData'
import type { CurrentUser, SocialProvider } from '../types'
import { isMockEmpty, mockRequest } from './mockClient'

// No valid session. Maps to a 401 from the real API, and shows the sign-in panel rather than an error.
export class UnauthorizedError extends Error {}

// Stands in for the session cookie. Persisted so sign-in and sign-out survive a reload, and a first
// visit starts signed out like a real visitor — otherwise the landing page (/) could never be seen,
// since it redirects members to the dashboard. Storage can be blocked (private windows), so reads
// and writes are guarded and the mock then falls back to in-memory state for the visit.
const SESSION_KEY = 'mock-session'
let isSignedIn = false
try {
  isSignedIn = localStorage.getItem(SESSION_KEY) === '1'
} catch {
  /* storage blocked: stay signed out, like a visitor without cookies */
}

function persistSession(signedIn: boolean) {
  isSignedIn = signedIn
  try {
    if (signedIn) localStorage.setItem(SESSION_KEY, '1')
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage blocked: the in-memory flag still covers this visit */
  }
}

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
  persistSession(true)
}

export async function signOut(): Promise<void> {
  await mockRequest('sign-out', null)
  persistSession(false)
}
