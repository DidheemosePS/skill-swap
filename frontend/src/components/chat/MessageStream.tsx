import { Fragment } from 'react'
import type { OutboxItem } from '../../hooks/useOutbox'
import type { Message } from '../../types'
import { formatSlotDay, formatSlotTime } from '../../utils/timeSlots'
import MessageBubble from './MessageBubble'
import RequestHistoryLine from './RequestHistoryLine'

interface MessageStreamProps {
  messages: Message[]
  outbox: OutboxItem[]
  myId: string
  peerName: string
  // The request shown in full in the pinned note, so it has no history line or day divider here.
  pinnedId: string | null
  // How many of their messages were unread when the thread opened: the divider goes before them.
  unreadAtOpen: number
  now: number
  onRetry: (id: string) => void
  onDiscard: (id: string) => void
}

const RUN_MS = 5 * 60_000

function dayLabel(iso: string, now: number) {
  const day = new Date(iso).toDateString()
  if (day === new Date(now).toDateString()) return 'Today'
  if (day === new Date(now - 86_400_000).toDateString()) return 'Yesterday'
  return formatSlotDay(iso)
}

const Divider = ({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'accent' }) => (
  <p role="separator" className={`flex items-center gap-3 text-xs font-semibold ${tone === 'accent' ? 'text-accent-strong' : 'text-muted'}`}>
    <span className={`h-px flex-1 ${tone === 'accent' ? 'bg-accent' : 'bg-line'}`} />
    {label}
    <span className={`h-px flex-1 ${tone === 'accent' ? 'bg-accent' : 'bg-line'}`} />
  </p>
)

// The thread as a reader scans it: a divider per day, one time per run of messages from the same person,
// a marker where the unread ones start, and the member's own unconfirmed sends with their state.
export default function MessageStream({ messages: allMessages, outbox, myId, peerName, pinnedId, unreadAtOpen, now, onRetry, onDiscard }: MessageStreamProps) {
  // The pinned request is shown in full above, so it's left out here, along with any divider it would add.
  const messages = allMessages.filter((message) => message.id !== pinnedId)
  const theirIds = messages.filter((message) => message.senderId !== myId && message.kind !== 'swap_request').map((message) => message.id)
  const firstUnreadId = unreadAtOpen > 0 ? theirIds[Math.max(theirIds.length - unreadAtOpen, 0)] : null
  const lastMineId = [...messages].reverse().find((message) => message.senderId === myId && message.kind !== 'swap_request')?.id

  return (
    <>
      {messages.map((message, index) => {
        const previous = messages[index - 1]
        const next = messages[index + 1]
        const newDay = !previous || new Date(previous.sentAt).toDateString() !== new Date(message.sentAt).toDateString()
        // The time shows once, under the last message of a run from the same sender.
        const endsRun = !next || next.senderId !== message.senderId || next.kind === 'swap_request' || Date.parse(next.sentAt) - Date.parse(message.sentAt) > RUN_MS
        return (
          <Fragment key={message.id}>
            {newDay && <Divider label={dayLabel(message.sentAt, now)} />}
            {message.id === firstUnreadId && <Divider label="New messages" tone="accent" />}
            {message.kind === 'swap_request' ? (
              <RequestHistoryLine request={message.swapRequest} peerName={peerName} timeLabel={formatSlotTime(message.sentAt)} />
            ) : (
              <MessageBubble
                message={message}
                isMine={message.senderId === myId}
                timeLabel={endsRun ? formatSlotTime(message.sentAt) : null}
                status={message.id === lastMineId && outbox.length === 0 ? 'Sent' : null}
              />
            )}
          </Fragment>
        )
      })}
      {outbox.map((item) => (
        <MessageBubble
          key={item.id}
          message={{ id: item.id, conversationId: '', senderId: myId, sentAt: item.sentAt, ...item.draft }}
          isMine
          timeLabel={null}
          status={
            item.status === 'sending' ? (
              'Sending…'
            ) : (
              <span className="text-danger">
                Couldn't send ·{' '}
                <button type="button" onClick={() => onRetry(item.id)} className="rounded font-semibold underline outline-none focus-visible:ring-2 focus-visible:ring-accent">Retry</button>
                {' · '}
                <button type="button" onClick={() => onDiscard(item.id)} className="rounded underline outline-none focus-visible:ring-2 focus-visible:ring-accent">Delete</button>
              </span>
            )
          }
        />
      ))}
    </>
  )
}
