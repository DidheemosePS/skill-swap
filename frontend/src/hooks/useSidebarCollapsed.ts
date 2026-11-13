import { useState } from 'react'

const KEY = 'skill-swap:sidebar'

// Remembered per browser, so a member who prefers the slim rail keeps it across pages and visits.
// Storage can throw (private mode, blocked site data), and then the full sidebar is the safe default.
function read() {
  try {
    return localStorage.getItem(KEY) === 'rail'
  } catch {
    return false
  }
}

export function useSidebarCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(read)
  function toggle() {
    setIsCollapsed((current) => {
      try {
        localStorage.setItem(KEY, current ? 'full' : 'rail')
      } catch {
        // Not remembered this time; the toggle still works for this visit.
      }
      return !current
    })
  }
  return { isCollapsed, toggle }
}
