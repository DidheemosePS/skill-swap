import { useEffect } from 'react'
import type { RefObject } from 'react'

// Closes a popover on a press outside it, on Escape, or when keyboard focus leaves it. Escape hands focus
// back to the button that opened it, so keyboard users aren't dropped on the page body. Listeners exist
// only while it's open. Shared by the avatar menu and the wallet explainer.
export function useDismiss(ref: RefObject<HTMLElement | null>, isOpen: boolean, close: () => void, triggerRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!isOpen) return
    const container = ref.current
    const closeIfOutside = (event: PointerEvent) => {
      if (!container?.contains(event.target as Node)) close()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      close()
      triggerRef?.current?.focus()
    }
    // Tabbing past the last item closes it, so two popovers are never open with focus elsewhere.
    const closeOnFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget && !container?.contains(event.relatedTarget as Node)) close()
    }
    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('keydown', closeOnEscape)
    container?.addEventListener('focusout', closeOnFocusOut)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('keydown', closeOnEscape)
      container?.removeEventListener('focusout', closeOnFocusOut)
    }
  }, [ref, isOpen, close, triggerRef])
}
