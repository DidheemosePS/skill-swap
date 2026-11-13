import { useState } from 'react'
import { fetchMemberProfile } from '../services/profileService'
import { fetchMySessions } from '../services/sessionService'
import type { ConversationSummary, MemberProfile, SessionDetail, SwapRequest } from '../types'
import { useToast } from './useToast'

export type SettleTarget = { session: SessionDetail; mode: 'resolve' | 'confirm' }

// Which dialog is open over a thread, plus the fetch each one needs first. The settle drawer and the booking
// form both load data before opening, so the button that opens them shows it's busy and a failure is said.
export function useThreadDialogs(peerId: string, owedSession: ConversationSummary['owedSession']) {
  const [counterRequest, setCounterRequest] = useState<SwapRequest | null>(null)
  const [settle, setSettle] = useState<SettleTarget | null>(null)
  const [booking, setBooking] = useState<MemberProfile | null>(null)
  const [opening, setOpening] = useState<'settle' | 'booking' | null>(null)
  const toast = useToast()

  async function load<T>(which: 'settle' | 'booking', fetcher: () => Promise<T | null | undefined>, open: (value: T) => void) {
    setOpening(which)
    try {
      const value = await fetcher()
      // A session settled elsewhere, or a member who left, comes back empty: say so rather than do nothing.
      if (value) open(value)
      else toast.error(which === 'settle' ? 'That session is already settled.' : "We couldn't find this member any more.")
    } catch {
      toast.error(`We couldn't open the ${which === 'settle' ? 'session' : 'booking form'}. Please try again.`)
    } finally {
      setOpening(null)
    }
  }

  const openSettle = () => {
    if (!owedSession) return
    void load('settle', async () => (await fetchMySessions()).find((item) => item.id === owedSession.id), (session) => setSettle({ session, mode: owedSession.mode }))
  }
  const openBooking = () => void load('booking', () => fetchMemberProfile(peerId), setBooking)

  return {
    counterRequest, setCounterRequest,
    settle, closeSettle: () => setSettle(null),
    booking, closeBooking: () => setBooking(null),
    openSettle, openBooking, opening,
  }
}
