import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import { useChatThread } from '../../hooks/useChatThread'
import { useNow } from '../../hooks/useNow'
import { sendMessage } from '../../services/chatService'
import type { ConversationSummary, MessageDraft, SwapRequest } from '../../types'
import { formatMessageTime, getChatAccess } from '../../utils/chat'
import AlertBanner from '../common/AlertBanner'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import ChatLockNotice from './ChatLockNotice'
import CounterOfferModal from './CounterOfferModal'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'
import SwapRequestCard from './SwapRequestCard'

interface ChatBoxProps {
  conversation: ConversationSummary
  skillNames: Map<string, string>
  highlightRequestId?: string
}

const NEAR_BOTTOM_PX = 80

// Key this by conversation ID, so scroll position and live messages reset between threads.
export default function ChatBox({ conversation, skillNames, highlightRequestId }: ChatBoxProps) {
  const { id: myId } = useCurrentUser()
  const { peer } = conversation
  const { messages, status, retry, applyMessage } = useChatThread(conversation.id)
  const now = useNow(60_000)
  const streamRef = useRef<HTMLDivElement>(null)
  // Follow new messages only when already at the bottom, so reading history isn't interrupted.
  const followLatest = useRef(true)
  const [isAwayFromLatest, setIsAwayFromLatest] = useState(false)
  const [counterRequest, setCounterRequest] = useState<SwapRequest | null>(null)
  const hasLoaded = status === 'ready' || messages.length > 0
  // Worked out from the thread, so the box opens the moment a card turns Confirmed.
  const chatAccess = getChatAccess(messages, myId, conversation.hasSessionHistory)

  function scrollToLatest() {
    const stream = streamRef.current
    if (stream) stream.scrollTop = stream.scrollHeight
  }

  useEffect(() => {
    if (followLatest.current) scrollToLatest()
  }, [messages.length])

  // Opening from a just-sent request jumps to its card once, after the thread has loaded.
  useEffect(() => {
    if (!hasLoaded || !highlightRequestId) return
    streamRef.current?.querySelector(`[data-request-id="${highlightRequestId}"]`)?.scrollIntoView({ block: 'center' })
  }, [hasLoaded, highlightRequestId])

  function handleScroll() {
    const stream = streamRef.current
    if (!stream) return
    const isNearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < NEAR_BOTTOM_PX
    followLatest.current = isNearBottom
    setIsAwayFromLatest(!isNearBottom)
  }

  async function send(draft: MessageDraft) {
    const message = await sendMessage(conversation.id, peer.id, draft)
    followLatest.current = true
    setIsAwayFromLatest(false)
    applyMessage(message)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-line bg-surface p-3">
        <Link to="/messages" className="rounded px-2 py-1 text-sm font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent lg:hidden">
          Back
        </Link>
        <Avatar name={peer.name} url={peer.avatarUrl} size="sm" />
        <h1 className="min-w-0 truncate font-semibold">
          <Link to={`/user/${peer.id}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{peer.name}</Link>
        </h1>
      </header>

      <div className="relative min-h-0 flex-1">
        <div ref={streamRef} onScroll={handleScroll} role="log" aria-label={`Conversation with ${peer.name}`} className="h-full space-y-4 overflow-y-auto overscroll-contain p-4">
          {!hasLoaded && status === 'loading' && (
            <div role="status" aria-label="Loading messages" className="space-y-3">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="ml-auto h-12 w-1/2" />
              <Skeleton className="h-32 w-3/4" />
            </div>
          )}
          {status === 'error' && <AlertBanner message="We couldn't load this conversation." onRetry={retry} />}
          {status === 'ready' && messages.length === 0 && (
            <EmptyState title="No messages yet" description="Messages appear here once a swap is accepted." />
          )}
          {messages.map((message) => {
            const timeLabel = formatMessageTime(message.sentAt, now)
            if (message.kind !== 'swap_request') {
              return <MessageBubble key={message.id} message={message} isMine={message.senderId === myId} timeLabel={timeLabel} />
            }
            return (
              <div key={message.id} className={`flex ${message.senderId === myId ? 'justify-end' : 'justify-start'}`}>
                <SwapRequestCard
                  request={message.swapRequest}
                  peerName={peer.name}
                  skillNames={skillNames}
                  timeLabel={timeLabel}
                  isHighlighted={message.swapRequest.id === highlightRequestId}
                  onUpdated={applyMessage}
                  onCounter={setCounterRequest}
                />
              </div>
            )
          })}
        </div>
        {isAwayFromLatest && (
          <Button variant="secondary" onClick={() => { followLatest.current = true; setIsAwayFromLatest(false); scrollToLatest() }} className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md">
            Jump to latest
          </Button>
        )}
      </div>

      {/* Stays hidden until the thread loads, so it can't flash the wrong state. */}
      {hasLoaded && (chatAccess === 'open' ? <MessageComposer onSend={send} /> : <ChatLockNotice access={chatAccess} peer={peer} />)}

      {counterRequest && (
        <CounterOfferModal
          request={counterRequest}
          peerId={peer.id}
          peerFirstName={peer.name.split(' ')[0]}
          onUpdated={applyMessage}
          onClose={() => setCounterRequest(null)}
        />
      )}
    </div>
  )
}
