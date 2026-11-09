import { mockCurrentUser } from '../data/mockData'
import type { OnboardingPayload, OnboardingResult } from '../types'
import { mockRequest } from './mockClient'

// The payload is unused until the real POST; a new member starts with only the free credit.
export async function completeOnboarding(_payload: OnboardingPayload): Promise<OnboardingResult> {
  const result = await mockRequest('onboarding', {
    isOnboarded: true as const,
    wallet: { credits: 1, escrowCredits: 0, hoursTaught: 0, hoursLearned: 0 },
  })
  // Like the server, the flag sticks, so a later GET /users/me doesn't send the member back here.
  mockCurrentUser.isOnboarded = true
  return result
}
