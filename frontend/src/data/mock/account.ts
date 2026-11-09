import type { ConnectedAccount } from '../../types'

// Alex signed up with GitHub and hasn't connected Google, so both connect and disconnect can be tried.
export const mockConnectedAccounts: ConnectedAccount[] = [
  { provider: 'github', username: 'alex-sample', url: 'https://example.com/github/alex-sample', showOnProfile: true },
]
