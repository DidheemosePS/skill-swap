import type { SessionStatus } from './session'
import type { User } from './user'

export type TransactionType =
  | 'onboarding_bonus'
  | 'teaching_reward'
  | 'session_booking'
  | 'escrow_refund'

export type TransactionStatus = 'settled' | 'in_escrow'

export interface Wallet {
  // Spendable balance; excludes credits held in escrow.
  credits: number
  escrowCredits: number
  hoursTaught: number
  hoursLearned: number
}

export interface Transaction {
  id: string
  createdAt: string
  type: TransactionType
  // Null for platform grants such as the onboarding bonus.
  partnerId: string | null
  amount: number
  status: TransactionStatus
  // Links an escrow row to its booking details.
  sessionId: string | null
}

// A ledger row with what the Wallet page shows beside it, so the ledger needs only one request.
export interface LedgerEntry extends Transaction {
  partner: Pick<User, 'id' | 'name'> | null
  session: { skillName: string; startsAt: string; status: SessionStatus; isTeaching: boolean } | null
}
