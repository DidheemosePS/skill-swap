import { useState } from 'react'

const KEY = 'skill-swap:tour'

// The tour runs once, for members who just finished onboarding: onboarding marks it pending, finishing or
// skipping marks it done, and members who joined before it existed never see it. Storage can throw (private
// mode, blocked site data); then the tour simply doesn't show, which is the safe side for existing members.
function read(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function write(value: 'pending' | 'done') {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    // Not remembered; at worst the tour shows once more next visit.
  }
}

export const queueWelcomeTour = () => write('pending')

export function useWelcomeTour() {
  const [isOpen, setIsOpen] = useState(() => read() === 'pending')
  return {
    isOpen,
    // Replay from the Wallet page.
    open: () => setIsOpen(true),
    close: () => {
      write('done')
      setIsOpen(false)
    },
  }
}
