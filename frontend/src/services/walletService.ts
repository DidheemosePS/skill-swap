import { CURRENT_USER_ID, mockSessions, mockSkills, mockTransactions, mockUsers, mockWallet } from '../data/mockData'
import type { LedgerEntry, Transaction, Wallet } from '../types'
import { mockRequest } from './mockClient'
import { runSessionChecks } from './sessionActions'

const EMPTY_WALLET: Wallet = { credits: 0, escrowCredits: 0, hoursTaught: 0, hoursLearned: 0 }

// Runs the expiry check first, so a refund from a lapsed request is already in the balance.
export function fetchWallet(): Promise<Wallet> {
  runSessionChecks()
  return mockRequest('wallet', { ...mockWallet }, EMPTY_WALLET)
}

function toLedgerEntry(transaction: Transaction): LedgerEntry {
  const user = mockUsers.find((item) => item.id === transaction.partnerId)
  const session = mockSessions.find((item) => item.id === transaction.sessionId)
  const skillName = mockSkills.find((skill) => skill.id === session?.skillId)?.name
  return {
    ...transaction,
    partner: user ? { id: user.id, name: user.name } : null,
    session: session && skillName
      ? { skillName, startsAt: session.startsAt, status: session.status, isTeaching: session.teacherId === CURRENT_USER_ID }
      : null,
  }
}

// Newest first, as the mock already stores them. The same checks run first, so a refund shows up with the balance.
export function fetchTransactions(): Promise<LedgerEntry[]> {
  runSessionChecks()
  return mockRequest('transactions', structuredClone(mockTransactions.map(toLedgerEntry)), [])
}
