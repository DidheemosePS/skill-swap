import type { LedgerEntry, TransactionType } from '../../types'

export type LedgerFilter = 'all' | 'earned' | 'spent' | 'escrow'

export const LEDGER_FILTERS: { id: LedgerFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'earned', label: 'Earned' },
  { id: 'spent', label: 'Spent' },
  { id: 'escrow', label: 'Held' },
]

export const TYPE_LABELS: Record<TransactionType, string> = {
  teaching_reward: 'Taught a session',
  onboarding_bonus: 'Welcome credit',
  session_booking: 'Booked a session',
  escrow_refund: 'Credit returned',
}

// A refund sits under Spent, next to the booking it reverses, rather than counting as earned.
const EARNED_TYPES: TransactionType[] = ['teaching_reward', 'onboarding_bonus']

export function matchesFilter(entry: LedgerEntry, filter: LedgerFilter): boolean {
  if (filter === 'earned') return EARNED_TYPES.includes(entry.type)
  if (filter === 'spent') return !EARNED_TYPES.includes(entry.type)
  if (filter === 'escrow') return entry.status === 'in_escrow'
  return true
}

// The filter lives in the URL, so an unknown value falls back to showing everything.
export const parseFilter = (value: string | null): LedgerFilter =>
  LEDGER_FILTERS.find((item) => item.id === value)?.id ?? 'all'
