import { createContext } from 'react'
import type { ChatEvent } from '../types'

export type SocketStatus = 'connecting' | 'connected' | 'disconnected'

export interface WebSocketContextValue {
  status: SocketStatus
  subscribe: (listener: (event: ChatEvent) => void) => () => void
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null)
