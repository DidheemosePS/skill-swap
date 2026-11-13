import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  // Blocks Esc, backdrop clicks and the close button, such as while a request is being sent.
  isLocked?: boolean
  // A drawer slides in along the right edge, for detail that goes with the page behind it.
  placement?: 'center' | 'drawer'
  // Actions pinned to the bottom, so they stay in reach however long the content scrolls.
  footer?: ReactNode
  children: ReactNode
}

const PLACEMENTS = {
  center: 'm-auto w-[calc(100%-2rem)] max-w-lg rounded-xl',
  // A column, so the footer sits at the bottom edge in thumb reach even when the content is short.
  drawer: 'my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-md open:flex open:flex-col',
}

// Mount this only while it's open. Native <dialog> provides the focus trap, Esc and focus return.
export default function Modal({ title, onClose, isLocked = false, placement = 'center', footer, children }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    // Unmounting removes the dialog before the browser can restore focus, so it's handed back here.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      dialog?.close()
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!isLocked) onClose()
      }}
      // A click whose target is the dialog itself landed on the backdrop, outside the padded content.
      onClick={(event) => {
        if (event.target === dialogRef.current && !isLocked) onClose()
      }}
      className={`bg-surface text-ink shadow-xl backdrop:bg-ink/40 ${PLACEMENTS[placement]}`}
    >
      {/* The dialog itself scrolls; header and footer stick, so the way out is always visible. */}
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-surface px-5 pt-5 pb-1 sm:px-6 sm:pt-6">
        <h2 id={titleId} className="pt-1.5 text-lg font-semibold text-balance">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isLocked}
          aria-label="Close"
          className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted outline-none transition-colors hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="flex-1 px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
      {footer && (
        // Stacked full-width on phones so labels never wrap; a row from sm.
        <div className="sticky bottom-0 grid gap-2 border-t border-line bg-surface px-5 py-4 sm:flex sm:items-center sm:justify-end sm:gap-3 sm:px-6">{footer}</div>
      )}
    </dialog>
  )
}
