import type { ChatEvent } from '../types'

type ChatListener = (event: ChatEvent) => void

const listeners = new Set<ChatListener>()

// Stands in for the WebSocket. The mock services call emit where the server would push an event.
export function connectChatSocket(listener: ChatListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitChatEvent(event: ChatEvent) {
  for (const listener of listeners) listener(event)
}

export const isChatSocketDown = () => String(import.meta.env.VITE_MOCK_FAIL ?? '').split(',').includes('socket')
