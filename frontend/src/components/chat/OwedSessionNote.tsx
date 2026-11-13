import type { ConversationSummary } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'
import { getButtonClasses } from '../common/buttonStyles'
import PlumNote from './PlumNote'

interface OwedSessionNoteProps {
  owed: NonNullable<ConversationSummary['owedSession']>
  firstName: string
  skillName: string
  // A row under a live session's note when that session needs the member first; the plum note otherwise.
  variant: 'plum' | 'row'
  isOpening: boolean
  onSettle: () => void
}

// An ended session whose outcome the member owes, named by what was taught, so it can't be mistaken for
// the request or booking shown beside it.
export default function OwedSessionNote({ owed, firstName, skillName, variant, isOpening, onSettle }: OwedSessionNoteProps) {
  const what = owed.iTaught ? `You taught ${firstName} ${skillName}` : `${firstName} taught you ${skillName}`
  const action = owed.mode === 'confirm' ? 'Confirm' : 'Did it happen?'
  const button = (tone: 'onNext' | 'secondary') => (
    <button type="button" onClick={onSettle} disabled={isOpening} aria-busy={isOpening} className={getButtonClasses(tone, 'shrink-0')}>
      {isOpening ? 'Opening…' : action}
    </button>
  )

  if (variant === 'row') {
    return (
      <section aria-label={`Earlier session: ${what}`} className="mt-3 flex items-center justify-between gap-x-4 rounded-xl bg-card px-4 py-1.5">
        <p className="min-w-0 text-sm">
          {/* Phones drop the label: the row sits under the live note, and "taught" already says it's past. */}
          <span className="hidden text-xs font-semibold text-muted sm:inline">Earlier session</span>
          <span className="mx-1.5 hidden text-muted sm:inline">·</span>
          <span className="font-semibold">{what}</span>
          <span className="figures hidden text-muted sm:inline"> · {formatSlotDateTime(owed.startsAt)}</span>
        </p>
        {button('secondary')}
      </section>
    )
  }

  return (
    <PlumNote label={`${what} · ended`} headline={owed.mode === 'confirm' ? `${firstName} marked it complete. Confirm it.` : 'Did it happen?'}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {button('onNext')}
        <p className="figures text-sm text-white">{formatSlotDateTime(owed.startsAt)}</p>
      </div>
    </PlumNote>
  )
}
