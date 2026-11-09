import { Link, useLocation, useSearchParams } from 'react-router-dom'
import ChatBox from '../components/chat/ChatBox'
import ConversationList from '../components/chat/ConversationList'
import AppNavbar from '../components/common/AppNavbar'
import { getButtonClasses } from '../components/common/buttonStyles'
import EmptyState from '../components/common/EmptyState'
import { useAsyncData } from '../hooks/useAsyncData'
import { useSkills } from '../hooks/useSkills'
import { useChatEvents, useWebSocket } from '../hooks/useWebSocket'
import { fetchConversations } from '../services/chatService'

interface MessagesLocationState {
  conversationId?: string
  swapRequestId?: string
}

export default function MessagesPage() {
  const conversations = useAsyncData(fetchConversations)
  const { skills } = useSkills()
  const { status: socketStatus } = useWebSocket()
  const [searchParams] = useSearchParams()
  const locationState = useLocation().state as MessagesLocationState | null

  // New previews and unread counts come from the server. WalletProvider reloads the balance itself.
  useChatEvents(conversations.retry)

  const list = conversations.data
  const peerId = searchParams.get('peer')
  // A thread can be opened by a list click (c), a "Request pending" link (peer), or a redirect
  // right after sending a request (location state).
  const selectedId =
    searchParams.get('c') ??
    (peerId ? list?.find((item) => item.peerId === peerId)?.id : locationState?.conversationId) ??
    null
  const selected = list?.find((item) => item.id === selectedId) ?? null
  const skillNames = new Map(skills.map((skill) => [skill.id, skill.name]))

  return (
    <>
      <title>Messages · Skill Swap</title>
      <AppNavbar />
      <main className="mx-auto grid h-[calc(100dvh-4.0625rem)] max-w-7xl lg:grid-cols-[3fr_7fr] lg:border-x lg:border-line">
        {/* On small screens the list and the thread take turns filling the page. */}
        <section aria-label="Conversations" className={`min-h-0 overflow-y-auto bg-surface lg:block lg:border-r lg:border-line ${selectedId ? 'hidden' : 'block'}`}>
          <h1 className="border-b border-line p-4 text-lg font-semibold">Messages</h1>
          <ConversationList conversations={list} status={conversations.status} onRetry={conversations.retry} selectedId={selectedId} />
        </section>

        <section aria-label="Chat" className={`min-h-0 flex-col lg:flex ${selectedId ? 'flex' : 'hidden'}`}>
          {socketStatus === 'disconnected' && (
            <p role="status" className="bg-danger-soft px-4 py-2 text-sm text-danger">Reconnecting. New messages may be delayed.</p>
          )}
          <div className="min-h-0 flex-1">
            {selected && (
              <ChatBox
                key={selected.id}
                conversation={selected}
                skillNames={skillNames}
                highlightRequestId={locationState?.conversationId === selected.id ? locationState.swapRequestId : undefined}
              />
            )}
            {!selected && (
              <div className="flex h-full items-center justify-center p-4">
                {selectedId && conversations.status === 'ready' ? (
                  <EmptyState
                    title="Conversation not found"
                    description="This conversation doesn't exist or is no longer available."
                    action={<Link to="/messages" className={getButtonClasses('secondary')}>All messages</Link>}
                  />
                ) : (
                  <p className="text-sm text-muted">{selectedId ? 'Loading conversation…' : 'Select a conversation to start chatting.'}</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
