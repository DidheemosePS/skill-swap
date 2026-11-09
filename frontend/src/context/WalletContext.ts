import { createContext } from 'react'
import type { AsyncStatus } from '../hooks/useAsyncData'
import type { Wallet } from '../types'

export interface WalletContextValue {
  wallet: Wallet | null
  status: AsyncStatus
  refresh: () => void
}

export const WalletContext = createContext<WalletContextValue | null>(null)
