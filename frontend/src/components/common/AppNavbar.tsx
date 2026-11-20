import { useAsyncData } from '../../hooks/useAsyncData'
import { useCurrentUser } from '../../hooks/useAuth'
import { useWallet } from '../../hooks/useWallet'
import { useChatEvents } from '../../hooks/useWebSocket'
import { fetchUnreadCount } from '../../services/chatService'
import Navbar from './Navbar'

export default function AppNavbar() {
  const user = useCurrentUser()
  const { wallet } = useWallet()
  const unread = useAsyncData(fetchUnreadCount)
  // Keeps the unread count current as messages arrive on any page.
  useChatEvents(unread.retry)

  return (
    <Navbar
      // Keeps the last known balance during a refetch, so the chip doesn't flicker on chat events.
      credits={wallet?.credits ?? null}
      heldCredits={wallet?.escrowCredits ?? null}
      counts={{ messages: unread.data ?? 0 }}
      name={user.name}
      avatarUrl={user.avatarUrl}
      profileId={user.id}
    />
  )
}
