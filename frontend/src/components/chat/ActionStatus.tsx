import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

interface ActionStatusProps {
  message: string
  // The next conversation still waiting on the member's reply, offered so they can keep going.
  next: { id: string; name: string } | null
  onDismiss: () => void
}

// Says what an action on the pinned note did, since the note changes or disappears. It takes focus, so
// keyboard and screen-reader users land on the outcome rather than on the page body.
export default function ActionStatus({ message, next, onDismiss }: ActionStatusProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [message])

  return (
    <div ref={ref} tabIndex={-1} role="status" className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-accent bg-accent-soft px-4 py-2 text-sm text-accent-strong outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset">
      <p className="font-medium">{message}</p>
      <span className="flex items-center gap-3">
        {next && (
          <Link to={`/messages?c=${next.id}`} className="inline-flex min-h-11 items-center rounded font-semibold underline-offset-3 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
            Next waiting: {next.name}
          </Link>
        )}
        <button type="button" onClick={onDismiss} className="inline-flex min-h-11 items-center rounded px-1 font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
          Dismiss
        </button>
      </span>
    </div>
  )
}
