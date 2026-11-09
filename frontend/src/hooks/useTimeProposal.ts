import { useState } from 'react'

// Times picked for a counter or a cancellation: listed slots plus the member's own suggestions.
export function useTimeProposal() {
  const [listTimes, setListTimes] = useState<string[]>([])
  const [customTimes, setCustomTimes] = useState<string[]>([])
  // Changing this remounts the fields, which refetches the slots after a time was taken.
  const [reloadKey, setReloadKey] = useState(0)

  function toggleListTime(slot: string) {
    setListTimes((current) => (current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]))
  }

  function reset() {
    setListTimes([])
    setCustomTimes([])
    setReloadKey((current) => current + 1)
  }

  return {
    listTimes,
    customTimes,
    allTimes: [...listTimes, ...customTimes],
    reloadKey,
    toggleListTime,
    addCustomTime: (startsAt: string) => setCustomTimes((current) => [...current, startsAt]),
    removeCustomTime: (startsAt: string) => setCustomTimes((current) => current.filter((item) => item !== startsAt)),
    reset,
  }
}

export type TimeProposal = ReturnType<typeof useTimeProposal>
