import { useState } from 'react'
import { sendMessage } from '../services/chatService'
import type { Message, MessageDraft } from '../types'

export interface OutboxItem {
  id: string
  draft: MessageDraft
  sentAt: string
  status: 'sending' | 'failed'
}

// Messages the member has sent that the server hasn't confirmed yet. They show in the thread at once with
// their own state ("Sending…", "Couldn't send · Retry"), so a send is never silent and nothing typed is lost.
export function useOutbox(conversationId: string, peerId: string, onDelivered: (message: Message) => void) {
  const [items, setItems] = useState<OutboxItem[]>([])

  async function deliver(item: OutboxItem) {
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: 'sending' } : entry)))
    try {
      const message = await sendMessage(conversationId, peerId, item.draft)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      onDelivered(message)
    } catch {
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: 'failed' } : entry)))
    }
  }

  function send(draft: MessageDraft) {
    const item: OutboxItem = { id: `out-${crypto.randomUUID()}`, draft, sentAt: new Date().toISOString(), status: 'sending' }
    setItems((current) => [...current, item])
    void deliver(item)
  }

  const retry = (id: string) => {
    const item = items.find((entry) => entry.id === id)
    if (item) void deliver(item)
  }
  const discard = (id: string) => setItems((current) => current.filter((entry) => entry.id !== id))

  return { items, send, retry, discard }
}
