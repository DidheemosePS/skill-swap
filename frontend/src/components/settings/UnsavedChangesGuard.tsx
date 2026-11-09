import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import Button from '../common/Button'
import Modal from '../common/Modal'

// Asks before unsaved changes are lost: in-app links get a modal, and closing or reloading the
// tab gets the browser's own prompt. Switching tabs only changes ?tab=, so it isn't blocked.
export default function UnsavedChangesGuard({ isDirty }: { isDirty: boolean }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname)

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  if (blocker.state !== 'blocked') return null
  return (
    <Modal title="Leave without saving?" onClose={() => blocker.reset()}>
      <p className="mt-2 text-sm text-muted">You have changes that haven't been saved. If you leave now, they'll be lost.</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => blocker.reset()}>Keep editing</Button>
        <Button onClick={() => blocker.proceed()}>Leave page</Button>
      </div>
    </Modal>
  )
}
