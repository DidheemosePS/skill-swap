import { useEffect, useState } from 'react'

export type AsyncStatus = 'loading' | 'error' | 'ready'

interface SettledRequest<T> {
  fetcher: () => Promise<T>
  attempt: number
  hasFailed: boolean
}

// The fetcher must be stable (outside the component, or useCallback): a new one triggers a refetch.
// Previous data stays available during a refetch, so a search can dim results rather than blank them.
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [settled, setSettled] = useState<SettledRequest<T> | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Ignore a stale response if the page unmounts or a newer request starts first.
    let isCurrent = true
    fetcher()
      .then((result) => {
        if (!isCurrent) return
        setData(result)
        setSettled({ fetcher, attempt, hasFailed: false })
      })
      .catch(() => {
        if (isCurrent) setSettled({ fetcher, attempt, hasFailed: true })
      })
    return () => {
      isCurrent = false
    }
  }, [fetcher, attempt])

  // Derived rather than stored: it's loading until the current request has settled.
  const isSettled = settled?.fetcher === fetcher && settled.attempt === attempt
  const status: AsyncStatus = !isSettled ? 'loading' : settled.hasFailed ? 'error' : 'ready'
  const retry = () => setAttempt((current) => current + 1)

  return { data, status, retry }
}
