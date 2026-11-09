import { Link } from 'react-router-dom'
import type { ChatAccess, User } from '../../types'
import { getButtonClasses } from '../common/buttonStyles'

interface ChatLockNoticeProps {
  access: Exclude<ChatAccess, 'open'>
  peer: User
}

export default function ChatLockNotice({ access, peer }: ChatLockNoticeProps) {
  const firstName = peer.name.split(' ')[0]
  const MESSAGES: Record<ChatLockNoticeProps['access'], string> = {
    waiting_on_peer: `Chat opens when ${firstName} accepts your request.`,
    waiting_on_you: 'Accept this request to start chatting.',
    closed: 'This request is closed. Send a new one to try again.',
    session_cancelled: 'This session was cancelled. Chat reopens if a new swap is accepted.',
    no_request: `Send ${firstName} a swap request to start chatting.`,
  }
  const canSendRequest = access === 'closed' || access === 'session_cancelled' || access === 'no_request'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface p-4">
      <p className="text-sm text-muted">{MESSAGES[access]}</p>
      {canSendRequest && (
        <Link to={`/user/${peer.id}`} className={getButtonClasses('secondary', 'shrink-0')}>Send a new request</Link>
      )}
    </div>
  )
}
