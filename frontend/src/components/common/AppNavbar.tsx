import { useEffect, useRef } from 'react'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useCurrentUser } from '../../hooks/useAuth'
import { useNow } from '../../hooks/useNow'
import { useWallet } from '../../hooks/useWallet'
import { useChatEvents } from '../../hooks/useWebSocket'
import { fetchUnreadCount } from '../../services/chatService'
import { fetchMySessions } from '../../services/sessionService'
import { getSessionPhase } from '../../utils/sessions'
import Navbar from './Navbar'

export default function AppNavbar() {
  const user = useCurrentUser()
  const { wallet, version } = useWallet()
  const unread = useAsyncData(fetchUnreadCount)
  const sessions = useAsyncData(fetchMySessions)
  // Settling, cancelling or confirming always refreshes the wallet, so its version is the cue to recount
  // sessions too; otherwise the Sessions count would lag behind an action taken on that very page.
  const lastVersion = useRef(version)
  useEffect(() => {
    if (lastVersion.current === version) return
    lastVersion.current = version
    sessions.retry()
  }, [version, sessions])
  // A slow tick notices a session ending while the page is open, which makes it need an outcome.
  const now = useNow(60_000)
  // Keeps the counts current as messages and accepted requests arrive on any page.
  useChatEvents(() => {
    unread.retry()
    sessions.retry()
  })
  // The same rule as the Sessions page's Settle section: an outcome to mark, or a teacher's marking to confirm.
  const sessionsNeedingYou = (sessions.data ?? []).filter((session) => {
    const phase = getSessionPhase(session, now)
    return phase === 'awaiting_settlement' || (phase === 'pending_learner_review' && !session.isTeaching)
  }).length

  return (
    <Navbar
      // Keeps the last known balance during a refetch, so the chip doesn't flicker on chat events.
      credits={wallet?.credits ?? null}
      heldCredits={wallet?.escrowCredits ?? null}
      counts={{ messages: unread.data ?? 0, sessions: sessionsNeedingYou }}
      name={user.name}
      avatarUrl={user.avatarUrl}
      profileId={user.id}
    />
  )
}
