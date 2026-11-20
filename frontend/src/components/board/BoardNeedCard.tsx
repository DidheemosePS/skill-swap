import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import type { InboxItem } from '../dashboard/inboxItems'

interface BoardNeedCardProps {
  item: InboxItem
  isPrimary: boolean
  onAct: () => void
  className?: string
}

// A reply owed as a coral index card: who, one sentence, one verb.
export default function BoardNeedCard({ item, isPrimary, onAct, className = '' }: BoardNeedCardProps) {
  const who = item.name.split(' ')[0]
  return (
    <article className={`flex flex-col gap-4 rounded-2xl bg-coral-soft p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <Avatar name={item.name} url={item.avatarUrl} size="sm" />
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug font-semibold">
            <Link to={`/user/${item.peerId}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{item.name}</Link>
          </h3>
          <p className="text-sm text-pretty text-ink">{item.line}</p>
        </div>
      </div>
      <Button variant={isPrimary ? 'primary' : 'secondary'} onClick={onAct} className="mt-auto self-start">
        {item.action.label}<span className="sr-only"> for {who}</span>
      </Button>
    </article>
  )
}
