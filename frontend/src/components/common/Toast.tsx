import { useEffect, useState } from 'react'
import Avatar from './Avatar'

export interface ToastItem {
  id: number
  tone: 'error' | 'success' | 'message'
  message: string
  // Message toasts: who wrote, and the button that opens the conversation.
  person?: { name: string; avatarUrl: string | null }
  action?: { label: string; onClick: () => void }
  retry?: () => void
}

// Errors stay long enough to read and act on; a success just confirms, so it leaves sooner.
const VISIBLE_MS = { error: 6000, success: 4000, message: 6000 }

// One result: near-black like the "now" card, a coral mark for a failure or a green tick for a success, the line,
// and Try again when a failed action can be rerun.
// It waits while hovered or focused, so nobody loses it mid-read.
export default function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setTimeout(() => onDismiss(toast.id), VISIBLE_MS[toast.tone])
    return () => clearTimeout(timer)
  }, [isPaused, onDismiss, toast.id, toast.tone])

  return (
    <li
      role={toast.tone === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="flex items-start gap-3 rounded-2xl bg-next py-3 pr-2 pl-3.5 text-sm text-white shadow-[0_12px_32px_rgb(22_24_29/0.28)] transition duration-300 ease-out starting:-translate-y-3 starting:opacity-0 motion-reduce:transition-none"
    >
      {toast.person ? (
        <span aria-hidden="true" className="shrink-0"><Avatar name={toast.person.name} url={toast.person.avatarUrl} size="xs" /></span>
      ) : toast.tone === 'error' ? (
        <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#ff8a73] text-next">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M8 4v5M8 12h.01" />
          </svg>
        </span>
      ) : (
        <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#5fd08f] text-next">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 8.4 2.6 2.6L12 5.5" />
          </svg>
        </span>
      )}
      {toast.person ? (
        <p className="min-w-0 flex-1 py-px">
          <span className="block font-semibold">{toast.person.name}</span>
          <span className="line-clamp-2 text-white/80">{toast.message}</span>
        </p>
      ) : (
        <p className="min-w-0 flex-1 py-px text-pretty">{toast.message}</p>
      )}
      {toast.action && (
        <button
          type="button"
          onClick={() => { onDismiss(toast.id); toast.action?.onClick() }}
          className="-my-1 inline-flex min-h-8 shrink-0 items-center self-center rounded-lg bg-white px-3 font-semibold text-ink outline-none hover:bg-next-soft focus-visible:ring-2 focus-visible:ring-white"
        >
          {toast.action.label}<span className="sr-only"> to {toast.person?.name}</span>
        </button>
      )}
      {toast.retry && (
        <button
          type="button"
          onClick={() => { onDismiss(toast.id); toast.retry?.() }}
          className="-my-1 inline-flex min-h-8 shrink-0 items-center rounded-lg px-2 font-semibold underline underline-offset-3 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
        >
          Try again
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="-my-1 grid size-8 shrink-0 place-items-center rounded-lg text-white/70 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="m4 4 8 8M12 4l-8 8" />
        </svg>
      </button>
    </li>
  )
}
