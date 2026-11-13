import type { ReactNode } from 'react'
import type { TextMessage } from '../../types'

interface MessageBubbleProps {
  message: TextMessage
  isMine: boolean
  // Null inside a run of messages: the time shows once, under the run's last message.
  timeLabel: string | null
  // The member's own delivery state: Sending…, Sent, or Couldn't send with Retry.
  status?: ReactNode
}

export default function MessageBubble({ message, isMine, timeLabel, status }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      <p
        className={`max-w-[85%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap [overflow-wrap:anywhere] sm:max-w-md ${isMine ? 'bg-next text-white' : 'bg-card'}`}
      >
        {message.body}
      </p>
      {(timeLabel || status) && (
        <p className="mt-1 text-xs text-muted">
          {timeLabel && <time dateTime={message.sentAt} className="figures">{timeLabel}</time>}
          {timeLabel && status && ' · '}
          {status && <span aria-live="polite">{status}</span>}
        </p>
      )}
    </div>
  )
}
