import type { CodeMessage, TextMessage } from '../../types'
import CodeSnippet from './CodeSnippet'

interface MessageBubbleProps {
  message: TextMessage | CodeMessage
  isMine: boolean
  timeLabel: string
}

export default function MessageBubble({ message, isMine, timeLabel }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      {message.kind === 'code' ? (
        <div className="w-full max-w-xl">
          <CodeSnippet language={message.language} code={message.code} />
        </div>
      ) : (
        <p
          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap [overflow-wrap:anywhere] sm:max-w-md ${isMine ? 'bg-accent text-white' : 'border border-line bg-surface'}`}
        >
          {message.body}
        </p>
      )}
      <time dateTime={message.sentAt} className="mt-1 text-xs text-muted">{timeLabel}</time>
    </div>
  )
}
