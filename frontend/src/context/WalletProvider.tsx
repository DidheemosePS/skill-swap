import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsyncData } from '../hooks/useAsyncData'
import { useChatEvents } from '../hooks/useWebSocket'
import { fetchWallet } from '../services/walletService'
import { WalletContext } from './WalletContext'

// One balance for the whole app, so the navbar badge and every credit view agree after any change.
// Lives inside the router (as a layout route) because it refreshes on navigation.
export default function WalletProvider({ children }: { children: ReactNode }) {
  const { data, status, retry } = useAsyncData(fetchWallet)
  const { pathname } = useLocation()
  const lastPathname = useRef(pathname)

  // fetchWallet also refunds lapsed requests, so each page visit refetches to keep that refund visible
  // straight away. The first render is skipped because useAsyncData has already started a fetch.
  useEffect(() => {
    if (lastPathname.current === pathname) return
    lastPathname.current = pathname
    retry()
  }, [pathname, retry])

  // An accepted, declined or cancelled request can move a credit while any page is open.
  useChatEvents(retry)

  return <WalletContext.Provider value={{ wallet: data, status, refresh: retry }}>{children}</WalletContext.Provider>
}
