import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import ChatBox from '../components/chat/ChatBox'
import ConversationList from '../components/chat/ConversationList'
import ConversationSearch from '../components/chat/ConversationSearch'
import { matchesFilter, matchesSearch, needsReply as isNeedsReply } from '../components/chat/conversationGroups'
import type { InboxFilter } from '../components/chat/conversationGroups'
import MessagesGuide from '../components/chat/MessagesGuide'
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
  // Phones hide the bottom tabs while a thread is open by URL (BottomTabs reads the same params), so the page takes their room.
  const hidesTabs = searchParams.has('c') || peerId !== null
  // A thread can be opened by a list click (c), a "Request pending" link (peer), or a redirect
  // right after sending a request (location state).
  const selectedId =
    searchParams.get('c') ??
    (peerId ? list?.find((item) => item.peerId === peerId)?.id : locationState?.conversationId) ??
    null
  const selected = list?.find((item) => item.id === selectedId) ?? null
  const skillNames = new Map(skills.map((skill) => [skill.id, skill.name]))
  const [now] = useState(() => Date.now())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<InboxFilter>('all')
  const needsReply = list?.filter((item) => isNeedsReply(item, now)) ?? []
  const isFiltered = query.trim() !== '' || filter !== 'all'
  // Filtering is client-side: the list is short, and it keeps typing instant.
  // Under Your turn the open thread stays listed while the member answers, so the row doesn't vanish
  // mid-reply. Unread is different: opening a thread reads it, so it leaves that filter straight away.
  const keepsOpen = (id: string) => id === selectedId && filter === 'needs'
  const shown = list && list.filter((item) => matchesSearch(item, query) && (keepsOpen(item.id) || matchesFilter(item, filter, now)))
  const needsCount = needsReply.length
  const unreadCount = list?.reduce((sum, item) => sum + item.unreadCount, 0) ?? 0
  // A ?peer= link waits on the list to find its thread, so it reads as loading rather than "select one".
  const isOpeningThread = selectedId !== null || (peerId !== null && list === null)
  const firstWaiting = needsReply.find((item) => item.id !== selectedId) ?? null

  return (
    <>
      <title>Messages · Skill Swap</title>
      <AppNavbar />
      <main id="main" tabIndex={-1} className={`outline-none grid ${hidesTabs ? 'h-[calc(100dvh-4.0625rem)]' : 'h-[calc(100dvh-8.0625rem-env(safe-area-inset-bottom))]'} md:h-[calc(100dvh-4.0625rem)] lg:h-dvh lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)]`}>
        {/* On small screens the list and the thread take turns filling the page. */}
        <section aria-label="Conversations" className={`min-h-0 overflow-y-auto bg-surface lg:block lg:border-r lg:border-line ${selectedId ? 'hidden' : 'block'}`}>
          {/* The thread's own heading is the h1 when one is open; the list keeps an h2 on large screens. */}
          <div className="px-4 pt-5 pb-3">
            {/* One h1 per view: the thread header owns it when a conversation is open. */}
            {selected ? <h2 className="text-2xl font-semibold text-ink">Messages</h2> : <h1 className="text-2xl font-semibold text-ink">Messages</h1>}
          </div>
          {/* The list comes first in the page, so keyboard users can jump straight to the open thread. */}
          {selected && (
            <a href="#thread" className="sr-only rounded px-4 text-sm font-semibold text-accent-strong outline-none focus:not-sr-only focus:inline-flex focus:min-h-11 focus:items-center focus-visible:ring-2 focus-visible:ring-accent">
              Skip to conversation with {selected.peer.name}
            </a>
          )}
          <ConversationSearch query={query} onQuery={setQuery} filter={filter} onFilter={setFilter} needsCount={needsCount} unreadCount={unreadCount} />
          <ConversationList
            conversations={shown}
            status={conversations.status}
            onRetry={conversations.retry}
            selectedId={selectedId}
            isFiltered={isFiltered}
            onClearFilter={() => {
              setQuery('')
              setFilter('all')
            }}
            query={query}
          />
        </section>

        {/* min-w-0 lets the grid track shrink, so a long headline truncates instead of widening the page. */}
        <section id="thread" tabIndex={-1} aria-label="Chat" className={`min-h-0 min-w-0 flex-col outline-none lg:flex ${selectedId ? 'flex' : 'hidden'}`}>
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
                nextNeedsReply={firstWaiting && { id: firstWaiting.id, name: firstWaiting.peer.name.split(' ')[0] }}
                onChanged={conversations.retry}
              />
            )}
            {!selected && selectedId && conversations.status === 'ready' && (
              <div className="flex h-full items-center justify-center p-4">
                <EmptyState
                  icon="chat"
                  title="Conversation not found"
                  description="This conversation doesn't exist or is no longer available."
                  action={<Link to="/messages" className={getButtonClasses('secondary')}>All messages</Link>}
                />
              </div>
            )}
            {!selected && isOpeningThread && conversations.status !== 'ready' && (
              <p role="status" className="flex h-full items-center justify-center p-4 text-sm text-muted">Loading conversation…</p>
            )}
            {/* Nothing open: the list is the to-do, so this side explains how to read it. */}
            {!isOpeningThread && <MessagesGuide />}
          </div>
        </section>
      </main>
    </>
  )
}
