import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  // Blocks Esc and backdrop clicks, such as while a request is being sent.
  isLocked?: boolean
  // A drawer slides in along the right edge, for detail that goes with the page behind it.
  placement?: 'center' | 'drawer'
  children: ReactNode
}

const PLACEMENTS = {
  center: 'm-auto w-[calc(100%-2rem)] max-w-lg rounded-xl',
  drawer: 'my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-md',
}

// Mount this only while it's open. Native <dialog> provides the focus trap, Esc and focus return.
export default function Modal({ title, onClose, isLocked = false, placement = 'center', children }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
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
      <div className="p-5 sm:p-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}
