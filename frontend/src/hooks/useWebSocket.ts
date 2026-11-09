import { use, useEffect, useRef } from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import type { ChatEvent } from '../types'

export function useWebSocket() {
  const value = use(WebSocketContext)
  if (!value) throw new Error('useWebSocket must be used inside WebSocketProvider')
  return value
}

// Keeps one subscription and always calls the latest listener, so a new listener never drops events.
export function useChatEvents(listener: (event: ChatEvent) => void) {
  const { subscribe } = useWebSocket()
  const latest = useRef(listener)
  useEffect(() => {
    latest.current = listener
  })
  // subscribe changes on every provider render, so the ref avoids resubscribing each time.
  const subscribeRef = useRef(subscribe)
  useEffect(() => subscribeRef.current((event) => latest.current(event)), [])
}
