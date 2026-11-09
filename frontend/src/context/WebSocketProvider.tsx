import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { connectChatSocket, isChatSocketDown } from '../services/chatSocket'
import type { ChatEvent } from '../types'
import { WebSocketContext } from './WebSocketContext'
import type { SocketStatus } from './WebSocketContext'

const MOCK_CONNECT_MS = 300

// One connection for the whole app, so messages reach the navbar bell on every page.
export default function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SocketStatus>('connecting')
  const listeners = useRef(new Set<(event: ChatEvent) => void>())

  useEffect(() => {
    const timer = setTimeout(() => setStatus(isChatSocketDown() ? 'disconnected' : 'connected'), MOCK_CONNECT_MS)
    const disconnect = isChatSocketDown()
      ? () => {}
      : connectChatSocket((event) => {
          for (const listener of listeners.current) listener(event)
        })
    return () => {
      clearTimeout(timer)
      disconnect()
    }
  }, [])

  function subscribe(listener: (event: ChatEvent) => void) {
    listeners.current.add(listener)
    return () => {
      listeners.current.delete(listener)
    }
  }

  return <WebSocketContext.Provider value={{ status, subscribe }}>{children}</WebSocketContext.Provider>
}
