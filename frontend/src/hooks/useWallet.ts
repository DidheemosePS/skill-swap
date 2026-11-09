import { use } from 'react'
import { WalletContext } from '../context/WalletContext'

export function useWallet() {
  const value = use(WalletContext)
  if (!value) throw new Error('useWallet must be used inside WalletProvider')
  return value
}
