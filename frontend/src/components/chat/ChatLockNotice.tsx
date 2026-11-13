import type { ChatAccess, User } from '../../types'
import Button from '../common/Button'
import StateCard from '../common/StateCard'
import { EmptyMark } from '../common/stateIcons'

interface ChatLockNoticeProps {
  access: Exclude<ChatAccess, 'open'>
  peer: User
  // The member declined or withdrew it themselves, so the copy says so rather than blaming the other side.
  closedByMe: boolean
  // Opens the booking form here, so starting again doesn't mean leaving the conversation.
  onRequest: () => void
  // The form loads the member's open times first, so the button shows it's working.
  isOpening: boolean
}

// Why the box is locked, said with the rule behind it, so the chat rules are learned here and not by guessing.
export default function ChatLockNotice({ access, peer, closedByMe, onRequest, isOpening }: ChatLockNoticeProps) {
  const firstName = peer.name.split(' ')[0]
  const COPY: Record<ChatLockNoticeProps['access'], { title: string; rule: string }> = {
    waiting_on_peer: { title: `Chat opens when ${firstName} accepts a time`, rule: 'To withdraw, open Details on the note above.' },
    waiting_on_you: { title: 'Chat opens when you accept a time', rule: `Or suggest other times; ${firstName} sees your note.` },
    closed: closedByMe
      ? { title: 'You closed this request', rule: 'Send a new request to chat again.' }
      : { title: 'This request is closed', rule: 'Send a new request to chat again.' },
    session_cancelled: { title: 'This session was cancelled', rule: 'Send a new request to chat again.' },
    no_request: { title: `Send ${firstName} a request to chat`, rule: 'Chat opens once a request is accepted.' },
  }
  const canSendRequest = access === 'closed' || access === 'session_cancelled' || access === 'no_request'

  // The same card as every other "not yet" state, sitting where the composer will be once chat opens.
  return (
    <div className="border-t border-line p-3 sm:p-4">
      <StateCard
        role="status"
        visual={<EmptyMark icon="lock" />}
        title={COPY[access].title}
        description={COPY[access].rule}
        // Offered even after the member closed it themselves: withdrawing to change the plan is common.
        action={canSendRequest && <Button variant="secondary" onClick={onRequest} isLoading={isOpening} className="lg:min-h-9 lg:px-4">Send a new request</Button>}
      />
    </div>
  )
}
