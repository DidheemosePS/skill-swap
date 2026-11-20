import { useEffect, useRef, useState } from 'react'
import { useCurrentUser } from '../../hooks/useAuth'
import { useChatThread } from '../../hooks/useChatThread'
import { useNow } from '../../hooks/useNow'
import { useOutbox } from '../../hooks/useOutbox'
import { useThreadDialogs } from '../../hooks/useThreadDialogs'
import type { ConversationSummary, Message } from '../../types'
import { getChatAccess } from '../../utils/chat'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'
import Skeleton from '../common/Skeleton'
import ActionStatus from './ActionStatus'
import ChatLockNotice from './ChatLockNotice'
import MessageComposer from './MessageComposer'
import MessageStream from './MessageStream'
import PinnedRequestNote from './PinnedRequestNote'
import ThreadDialogs from './ThreadDialogs'
import ThreadHeader from './ThreadHeader'

interface ChatBoxProps {
  conversation: ConversationSummary
  skillNames: Map<string, string>
  highlightRequestId?: string
  // The next conversation waiting on the member's reply, offered after they act here.
  nextNeedsReply: { id: string; name: string } | null
  // Settling or requesting changes what the list shows, so it reloads.
  onChanged: () => void
}

const NEAR_BOTTOM_PX = 80
const SESSION_MS = 3_600_000

// Key this by conversation ID, so scroll position, unread marker and live messages reset between threads.
export default function ChatBox({ conversation, skillNames, highlightRequestId, nextNeedsReply, onChanged }: ChatBoxProps) {
  const { id: myId } = useCurrentUser()
  const { peer, settling } = conversation
  const firstName = peer.name.split(' ')[0]
  const { messages, status, retry, applyMessage } = useChatThread(conversation.id)
  const outbox = useOutbox(conversation.id, peer.id, (message) => applyMessage(message))
  const now = useNow(60_000)
  const streamRef = useRef<HTMLDivElement>(null)
  // Follow new messages only when already at the bottom, so reading history isn't interrupted.
  const followLatest = useRef(true)
  const [isAwayFromLatest, setIsAwayFromLatest] = useState(false)
  const [unreadAtOpen] = useState(conversation.unreadCount)
  const dialogs = useThreadDialogs(peer.id, settling)
  const [actionStatus, setActionStatus] = useState<string | null>(null)
  const hasLoaded = status === 'ready' || messages.length > 0
  // Worked out from the thread, so the box opens the moment a request turns Confirmed.
  const chatAccess = getChatAccess(messages, myId, conversation.hasSessionHistory)
  // The newest request is pinned above the thread while it's live: pending, or booked and not yet over.
  const latest = messages.findLast((message) => message.kind === 'swap_request')
  const pinned =
    latest?.kind === 'swap_request' &&
    (latest.swapRequest.status === 'pending' || (latest.swapRequest.status === 'confirmed' && latest.swapRequest.confirmedStartsAt !== null && Date.parse(latest.swapRequest.confirmedStartsAt) + SESSION_MS > now))
      ? latest
      : null

  // Applies an answered request and says what happened, since the note it came from changes or goes.
  function handleUpdated(message: Message) {
    applyMessage(message)
    if (message.kind !== 'swap_request') return
    const { status: requestStatus, swapType, learnerId } = message.swapRequest
    const paid = swapType === 'one_way'
    const outcome: Partial<Record<typeof requestStatus, string>> = {
      confirmed: 'Booked. Chat is open, and the session is in Sessions.',
      declined: `Declined. ${paid ? `${firstName}'s credit went back to them.` : 'Their times are open again.'}`,
      cancelled: `Withdrawn. ${paid && learnerId === myId ? 'Your credit is back.' : 'Your times are open again.'}`,
      pending: `New times sent to ${firstName}.`,
    }
    if (outcome[requestStatus]) setActionStatus(outcome[requestStatus] ?? null)
    // The row moves group (Needs your reply to Booked, say), so the list reloads too.
    onChanged()
  }

  function scrollToLatest() {
    const stream = streamRef.current
    if (stream) stream.scrollTop = stream.scrollHeight
  }

  useEffect(() => {
    if (followLatest.current) scrollToLatest()
  }, [messages.length, outbox.items.length])

  // Opening from a just-sent request jumps to it once, after the thread has loaded.
  useEffect(() => {
    if (!hasLoaded || !highlightRequestId) return
    document.querySelector(`[data-request-id="${highlightRequestId}"]`)?.scrollIntoView({ block: 'center' })
  }, [hasLoaded, highlightRequestId])

  function handleScroll() {
    const stream = streamRef.current
    if (!stream) return
    const isNearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < NEAR_BOTTOM_PX
    followLatest.current = isNearBottom
    setIsAwayFromLatest(!isNearBottom)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ThreadHeader peer={peer} />

      {actionStatus && <ActionStatus message={actionStatus} next={nextNeedsReply} onDismiss={() => setActionStatus(null)} />}
      {(settling || pinned?.kind === 'swap_request') && (
        <div className={`px-3 pt-3 sm:px-6 sm:pt-4 ${pinned?.kind === 'swap_request' && pinned.swapRequest.id === highlightRequestId ? 'ring-2 ring-accent ring-inset' : ''}`}>
          <PinnedRequestNote
            request={pinned?.kind === 'swap_request' ? pinned.swapRequest : null}
            sentAt={pinned?.sentAt ?? null}
            settling={settling}
            peerName={peer.name}
            peerAvatarUrl={peer.avatarUrl}
            skillNames={skillNames}
            onUpdated={handleUpdated}
            onCounter={dialogs.setCounterRequest}
            onSettle={dialogs.openSettle}
            isOpeningSettle={dialogs.opening === 'settle'}
          />
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <div ref={streamRef} onScroll={handleScroll} role="log" aria-label={`Conversation with ${peer.name}`} className="h-full space-y-3 overflow-y-auto overscroll-contain p-4 sm:px-6">
          {!hasLoaded && status === 'loading' && (
            <div role="status" aria-label="Loading messages" className="space-y-3">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="ml-auto h-12 w-1/2" />
              <Skeleton className="h-32 w-3/4" />
            </div>
          )}
          {status === 'error' && <AlertBanner message="We couldn't load this conversation." onRetry={retry} />}
          {status === 'ready' && messages.length === 0 && (
            <EmptyState icon="chat" title="No messages yet" description="Messages appear here once a request is accepted." />
          )}
          <MessageStream
            messages={messages}
            outbox={outbox.items}
            myId={myId}
            peerName={peer.name}
            pinnedId={pinned?.id ?? null}
            unreadAtOpen={unreadAtOpen}
            now={now}
            onRetry={outbox.retry}
            onDiscard={outbox.discard}
          />
        </div>
        {isAwayFromLatest && (
          <Button variant="secondary" onClick={() => { followLatest.current = true; setIsAwayFromLatest(false); scrollToLatest() }} className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md">
            Jump to latest
          </Button>
        )}
      </div>

      {/* Stays hidden until the thread loads, so it can't flash the wrong state. */}
      {hasLoaded &&
        (chatAccess === 'open' ? (
          <MessageComposer onSend={(draft) => { followLatest.current = true; setIsAwayFromLatest(false); outbox.send(draft) }} />
        ) : (
          <ChatLockNotice access={chatAccess} peer={peer} closedByMe={conversation.latestRequest?.closedByMe ?? false} onRequest={dialogs.openBooking} isOpening={dialogs.opening === 'booking'} />
        ))}

      <ThreadDialogs
        peerId={peer.id}
        peerFirstName={firstName}
        counterRequest={dialogs.counterRequest}
        onCounterClose={() => dialogs.setCounterRequest(null)}
        onUpdated={handleUpdated}
        settle={dialogs.settle}
        onSettleClose={dialogs.closeSettle}
        onSettled={(message) => {
          dialogs.closeSettle()
          setActionStatus(message)
          onChanged()
        }}
        booking={dialogs.booking}
        onBookingClose={dialogs.closeBooking}
        onRequested={() => {
          retry()
          onChanged()
          setActionStatus(`Request sent to ${firstName}.`)
        }}
      />
    </div>
  )
}
