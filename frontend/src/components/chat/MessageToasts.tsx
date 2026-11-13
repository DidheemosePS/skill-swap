import { useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useChatEvents } from '../../hooks/useWebSocket'
import { fetchConversations } from '../../services/chatService'

// Says when someone writes to the member anywhere in the app, except in the conversation they already have open.
// Renders nothing itself; it turns socket messages into toasts with a Reply that opens the thread.
export default function MessageToasts() {
  const { id: myId } = useCurrentUser()
  const toast = useToast()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const openThread = pathname === '/messages' ? new URLSearchParams(search).get('c') : null

  useChatEvents((event) => {
    // Only new text from someone else: request updates re-send the same card and show in the counts instead.
    if (event.type !== 'message' || event.message.kind !== 'text' || event.message.senderId === myId) return
    const { conversationId, body } = event.message
    if (conversationId === openThread) return
    // The event carries the sender's id only, so the name and face come from the conversation list.
    fetchConversations()
      .then((list) => {
        const peer = list.find((item) => item.id === conversationId)?.peer
        if (peer) toast.message({ name: peer.name, avatarUrl: peer.avatarUrl }, body, () => navigate(`/messages?c=${conversationId}`))
      })
      .catch(() => {})
  })

  return null
}
