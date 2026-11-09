import { useCallback, useState } from 'react'
import { fetchMessages, markConversationRead } from '../services/chatService'
import type { Message } from '../types'
import { useAsyncData } from './useAsyncData'
import { useChatEvents } from './useWebSocket'

// Marking read can fail without harm: the unread badge just stays until the next successful call.
const markRead = (conversationId: string) => {
  markConversationRead(conversationId).catch(() => {})
}

// Use one instance per open conversation (key the component), so live messages never carry over.
export function useChatThread(conversationId: string) {
  const fetcher = useCallback(() => {
    markRead(conversationId)
    return fetchMessages(conversationId)
  }, [conversationId])
  const { data, status, retry } = useAsyncData(fetcher)
  const [liveMessages, setLiveMessages] = useState<Message[]>([])

  // Same ID replaces rather than duplicates: this also covers a request card changing status,
  // and a sent message arriving from both the HTTP response and the socket.
  const applyMessage = (message: Message) =>
    setLiveMessages((current) => [...current.filter((item) => item.id !== message.id), message])

  useChatEvents((event) => {
    if (event.type !== 'message' || event.message.conversationId !== conversationId) return
    applyMessage(event.message)
    markRead(conversationId)
  })

  const liveIds = new Set(liveMessages.map((message) => message.id))
  const messages = [...(data ?? []).filter((message) => !liveIds.has(message.id)), ...liveMessages].sort(
    (a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt),
  )

  return { messages, status, retry, applyMessage }
}
