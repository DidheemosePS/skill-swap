import type { ReactNode } from 'react'
import Avatar from '../common/Avatar'

interface PaperRowProps {
  person: { name: string; avatarUrl: string | null }
  // The question or fact, said as a sentence ("Did your Python session with Dina happen?").
  title: string
  children: ReactNode
  // The member's own move is the black primary here, so it reads before the ones waiting on someone else.
  action?: ReactNode
}

// An ended session that isn't closed yet, as a card: who, the question, one short line, and the answer.
export default function PaperRow({ person, title, children, action }: PaperRowProps) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl bg-card p-5">
      <div className="flex items-start gap-3.5">
        <Avatar name={person.name} url={person.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-balance text-ink">{title}</p>
          <div className="text-sm text-muted [&>p]:mt-0.5">{children}</div>
        </div>
      </div>
      {action && <div className="[&>*]:w-full sm:[&>*]:w-auto">{action}</div>}
    </li>
  )
}
