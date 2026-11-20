import type { ConversationSummary } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import SettlingActions from '../schedule/SettlingActions'
import type { SettleStep } from '../schedule/SettlingDrawer'

interface SettlingNoteProps {
  settling: NonNullable<ConversationSummary['settling']>
  firstName: string
  skillName: string
  isOpening: boolean
  onOpen: (step: SettleStep) => void
}

// An ended session with this person in its 24-hour window, named by what was taught so it can't be mistaken
// for the request or booking beside it. Always a quiet row: it settles on its own, so it's never the member's move.
export default function SettlingNote({ settling, firstName, skillName, isOpening, onOpen }: SettlingNoteProps) {
  const what = settling.iTaught ? `You taught ${firstName} ${skillName}` : `${firstName} taught you ${skillName}`
  return (
    <section aria-label={`Settling: ${what}`} className="mt-3 flex flex-wrap items-center justify-between gap-x-4 rounded-xl border border-line bg-card px-4 py-1.5 first:mt-0">
      <p className="min-w-0 py-1 text-sm">
        <span className="text-xs font-semibold text-muted">Settling</span>
        <span className="mx-1.5 text-muted">·</span>
        <span className="font-semibold">{what}</span>
        <span className="figures hidden text-muted sm:inline"> · {formatSlotDateTime(settling.startsAt)}</span>
      </p>
      <SettlingActions iConfirmed={settling.iConfirmed} partnerFirstName={firstName} onOpen={onOpen} isOpening={isOpening} />
    </section>
  )
}
