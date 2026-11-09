import type { Transaction, Wallet } from '../../types'
import { fromNow } from './time'

// Hours count the completed sessions in sessions.ts; the two-way session counts on both sides.
export const mockWallet: Wallet = {
  credits: 2,
  escrowCredits: 2,
  hoursTaught: 5,
  hoursLearned: 2,
}

// Newest first. The amounts add up to mockWallet.credits, so the ledger and summary agree.
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-9',
    createdAt: fromNow({ days: -1 }),
    type: 'session_booking',
    partnerId: 'user-bea',
    amount: -1,
    status: 'in_escrow',
    sessionId: 'session-bea-review',
  },
  {
    id: 'tx-7',
    createdAt: fromNow({ days: -1 }),
    type: 'session_booking',
    partnerId: 'user-faye',
    amount: -1,
    status: 'in_escrow',
    sessionId: 'session-faye-escrow',
  },
  {
    id: 'tx-6',
    createdAt: fromNow({ days: -7 }),
    type: 'teaching_reward',
    partnerId: 'user-dina',
    amount: 1,
    status: 'settled',
    sessionId: 'session-dina-done',
  },
  {
    id: 'tx-5',
    createdAt: fromNow({ days: -9 }),
    type: 'escrow_refund',
    partnerId: 'user-gus',
    amount: 1,
    status: 'settled',
    sessionId: 'session-gus-cancelled',
  },
  {
    id: 'tx-4',
    createdAt: fromNow({ days: -10 }),
    type: 'session_booking',
    partnerId: 'user-gus',
    amount: -1,
    status: 'settled',
    sessionId: 'session-gus-cancelled',
  },
  {
    id: 'tx-8',
    createdAt: fromNow({ days: -11 }),
    type: 'teaching_reward',
    partnerId: 'user-ivo',
    amount: 1,
    status: 'settled',
    sessionId: 'session-ivo-react-done',
  },
  {
    id: 'tx-3',
    createdAt: fromNow({ days: -14 }),
    type: 'teaching_reward',
    partnerId: 'user-ivo',
    amount: 1,
    status: 'settled',
    sessionId: 'session-ivo-done',
  },
  {
    id: 'tx-2',
    createdAt: fromNow({ days: -20 }),
    type: 'session_booking',
    partnerId: 'user-bea',
    amount: -1,
    status: 'settled',
    sessionId: 'session-bea-spanish-done',
  },
  {
    id: 'tx-1',
    createdAt: fromNow({ days: -24 }),
    type: 'teaching_reward',
    partnerId: 'user-hana',
    amount: 1,
    status: 'settled',
    sessionId: 'session-hana-done',
  },
  {
    id: 'tx-0',
    createdAt: fromNow({ days: -30 }),
    type: 'onboarding_bonus',
    partnerId: null,
    amount: 1,
    status: 'settled',
    sessionId: null,
  },
]
