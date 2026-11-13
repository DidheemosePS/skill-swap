import { createContext } from 'react'
import type { AsyncStatus } from '../hooks/useAsyncData'
import type { Wallet } from '../types'

export interface WalletContextValue {
  wallet: Wallet | null
  status: AsyncStatus
  refresh: () => void
  // Goes up on every explicit refresh. Credits move only when sessions or requests change, so views that
  // count sessions (the navbar) recount when it changes.
  version: number
}

export const WalletContext = createContext<WalletContextValue | null>(null)
