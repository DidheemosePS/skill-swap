import { useWallet } from '../../hooks/useWallet'
import type { SettleTarget } from '../../hooks/useThreadDialogs'
import type { MemberProfile, Message, SwapRequest } from '../../types'
import SettleSessionDialogs from '../schedule/SettleSessionDialogs'
import SwapRequestModal from '../schedule/SwapRequestModal'
import CounterOfferModal from './CounterOfferModal'

interface ThreadDialogsProps {
  peerId: string
  peerFirstName: string
  counterRequest: SwapRequest | null
  onCounterClose: () => void
  onUpdated: (message: Message) => void
  settle: SettleTarget | null
  onSettleClose: () => void
  onSettled: (message: string) => void
  booking: MemberProfile | null
  onBookingClose: () => void
  // The new request lands in this thread, so the thread reloads and says it was sent.
  onRequested: () => void
}

// Every step the thread can start (suggest times, settle a session, request again) opens here, over the
// conversation, so acting on it never means leaving for another page.
export default function ThreadDialogs({ peerId, peerFirstName, counterRequest, onCounterClose, onUpdated, settle, onSettleClose, onSettled, booking, onBookingClose, onRequested }: ThreadDialogsProps) {
  const wallet = useWallet()
  return (
    <>
      {counterRequest && (
        <CounterOfferModal request={counterRequest} peerId={peerId} peerFirstName={peerFirstName} onUpdated={onUpdated} onClose={onCounterClose} />
      )}
      {/* Always mounted, so the rating step can follow a drawer that has already closed. */}
      <SettleSessionDialogs session={settle?.session ?? null} step={settle?.step ?? 'confirm'} onClose={onSettleClose} onSettled={onSettled} />
      {booking && (
        <SwapRequestModal
          offer={booking}
          credits={wallet.status === 'ready' ? (wallet.wallet?.credits ?? null) : null}
          existingSessionAt={booking.nextSessionAt}
          onClose={onBookingClose}
          onSent={() => {
            onBookingClose()
            onRequested()
          }}
        />
      )}
    </>
  )
}
