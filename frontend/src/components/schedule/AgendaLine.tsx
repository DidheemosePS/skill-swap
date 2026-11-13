import { Link } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import type { AgendaItem } from '../../hooks/useSessionsPage'
import type { SessionDetail } from '../../types'
import { canOfferAlternatives, formatCountdown } from '../../utils/sessions'
import { formatSlotTime } from '../../utils/timeSlots'
import { getButtonClasses } from '../common/buttonStyles'
import SwapPair from '../common/SwapPair'
import JoinMeetingButton from './JoinMeetingButton'
import { swapTitle } from './sessionLabels'

export interface AgendaActions {
  onReschedule: (session: SessionDetail) => void
  onCancel: (session: SessionDetail) => void
}

interface AgendaLineProps extends AgendaActions {
  item: AgendaItem
  // "Today", "Tmrw", "Fri": the short day over the date number.
  dayLabel: string
  now: number
  isImminent: boolean
}

const quiet = 'rounded font-medium text-muted underline-offset-2 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-accent'
const action = getButtonClasses('secondary', 'lg:min-h-9 lg:px-4')

// One session as a card: date block, the two people, the swap's name, and one action. Requested times are the
// same card, dashed and faded, until a time is agreed in Messages.
export default function AgendaLine({ item, dayLabel, now, isImminent, onReschedule, onCancel }: AgendaLineProps) {
  const me = useCurrentUser()
  const booked = item.kind === 'booked' ? item.session : null
  const request = item.kind === 'requested' ? item.request : null
  const partner = booked?.partner ?? request!.partner
  const first = partner.name.split(' ')[0]
  const deal = booked ?? request!
  const title = swapTitle({ partnerName: partner.name, skillName: deal.skillName, returnSkillName: deal.returnSkillName, isTeaching: deal.isTeaching })
  const hasStarted = Date.parse(item.at) <= now
  const canChange = booked && !hasStarted && !isImminent
  const date = new Date(item.at)

  return (
    <li aria-label={`${dayLabel} ${formatSlotTime(item.at)}, ${partner.name}`} className={`flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl px-4 py-4 sm:flex-nowrap sm:px-5 ${request ? 'border border-dashed border-faint/50 bg-surface' : 'bg-card'}`}>
      <p aria-hidden="true" className="w-12 shrink-0 text-center leading-tight">
        <span className="block text-[0.6875rem] font-semibold text-faint uppercase">{dayLabel}</span>
        <span className="figures block font-display text-2xl font-semibold text-ink">{date.getDate()}</span>
        <span className="figures block text-xs text-faint">{formatSlotTime(item.at)}</span>
      </p>
      <SwapPair me={me} partner={partner} size="sm" ringClass={request ? 'ring-surface' : 'ring-card'} />
      <div className="min-w-0 flex-1 basis-48">
        <Link to={`/user/${partner.id}`} className="rounded font-display text-base font-semibold text-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">{title}</Link>
        <p className="text-sm text-muted">
          {request ? (
            <>Requested · {request.awaitingMe ? 'your turn to reply' : `${first}'s turn to reply`}{request.expiresAt && <> · expires in <span className="figures">{formatCountdown(Date.parse(request.expiresAt) - now)}</span></>}</>
          ) : isImminent ? (
            <>Starts in <span className="figures">{Math.max(Math.ceil((Date.parse(item.at) - now) / 60_000), 1)}</span> min</>
          ) : canChange ? (
            <span className="flex flex-wrap gap-x-3">
              {canOfferAlternatives(booked, me.id) && <button type="button" onClick={() => onReschedule(booked)} className={quiet}>Reschedule</button>}
              <button type="button" onClick={() => onCancel(booked)} className={quiet}>Cancel</button>
            </span>
          ) : 'In progress'}
        </p>
      </div>
      <div className="shrink-0">
        {request && <Link to={`/messages?peer=${partner.id}`} className={action}>{request.awaitingMe ? 'Reply' : 'View request'}</Link>}
        {/* The session starting now joins from its own card: the page's one primary action. */}
        {booked && isImminent && <JoinMeetingButton session={booked} now={now} partnerName={first} className="lg:min-h-9 lg:px-4" />}
        {booked && !isImminent && booked.conversationExists && <Link to={`/messages?peer=${partner.id}`} className={action}>Chat<span className="sr-only"> with {first}</span></Link>}
      </div>
    </li>
  )
}
