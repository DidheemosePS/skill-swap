import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../components/common/Toast'
import type { ToastItem } from '../components/common/Toast'
import { ToastContext } from './ToastContext'

const MAX_SHOWN = 3

// The open modal dialog on top, if any. A modal <dialog> makes everything outside it inert, so a toast
// rendered on <body> would show but ignore clicks; rendered inside the dialog, its buttons work.
const topDialog = () => [...document.querySelectorAll<HTMLDialogElement>('dialog:modal')].at(-1) ?? null

// Failed actions report here instead of inside the form or card that sent them, so every failure reads the same
// way and survives the dialog closing. They sit at the top centre, clear of the save bar, composer, phone tabs
// and dialog footers. The stack is a manual popover, which puts it in the top layer above the dialog's content.
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [host, setHost] = useState<HTMLDialogElement | null>(null)
  const stackRef = useRef<HTMLOListElement>(null)

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])

  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    setHost(topDialog())
    // The same message twice replaces the first, so a double click doesn't stack two identical toasts.
    setToasts((current) => [...current.filter((item) => item.message !== toast.message), { ...toast, id: Date.now() + Math.random() }].slice(-MAX_SHOWN))
  }, [])

  const api = useMemo(() => ({
    error: (message: string, retry?: () => void) => push({ tone: 'error', message, retry }),
    success: (message: string) => push({ tone: 'success', message }),
    message: (from: { name: string; avatarUrl: string | null }, preview: string, onOpen: () => void) =>
      push({ tone: 'message', message: preview, person: from, action: { label: 'Reply', onClick: onOpen } }),
  }), [push])

  // When that dialog closes, the stack moves back to <body> so the toast outlives it.
  useEffect(() => {
    if (!host) return
    const leave = () => setHost(topDialog())
    host.addEventListener('close', leave)
    return () => host.removeEventListener('close', leave)
  }, [host])

  // Re-showing moves the stack to the top of the top layer, so a toast raised from inside a dialog sits above it.
  useLayoutEffect(() => {
    // A toast raised as its dialog closes waits here for that dialog's close event, which moves it to the page.
    const stack = stackRef.current
    if (!stack?.isConnected) return
    if (stack.matches(':popover-open')) stack.hidePopover()
    if (toasts.length > 0) stack.showPopover()
  }, [toasts, host])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <ol
          ref={stackRef}
          popover="manual"
          aria-label="Notifications"
          className="fixed inset-x-4 top-[4.75rem] bottom-auto m-0 flex flex-col gap-2 overflow-visible border-0 bg-transparent p-0 md:inset-x-0 md:top-6 md:mx-auto md:w-[28rem]"
        >
          {toasts.map((toast) => <Toast key={toast.id} toast={toast} onDismiss={dismiss} />)}
        </ol>,
        host ?? document.body,
      )}
    </ToastContext.Provider>
  )
}
