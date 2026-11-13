import { Link } from 'react-router-dom'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import { useNow } from '../../hooks/useNow'
import type { MemberProfile, UserSkill, WeeklyAvailability } from '../../types'
import { slotKey, WEEKDAYS } from '../../utils/availability'
import { getJoinState } from '../../utils/sessions'
import { PROFICIENCY_LABELS } from '../../utils/skills'
import { formatSlotDateTime } from '../../utils/timeSlots'
import Button from '../common/Button'
import { getButtonClasses } from '../common/buttonStyles'
import JoinMeetingButton from '../schedule/JoinMeetingButton'
import NoteLink from './NoteLink'
import { useCurrentUser } from '../../hooks/useAuth'
import SwapPair from '../common/SwapPair'

interface ExchangeNoteProps {
  profile: MemberProfile
  // Both weeks in the viewer's timezone, so the shared hours match the grid and the booking picker.
  theirWeek: WeeklyAvailability
  yourWeek: WeeklyAvailability | null
  credits: number | null
  walletStatus: AsyncStatus
  onRetryWallet: () => void
  onRequest: () => void
}

const SOON_MS = 60 * 60_000
const findSkill = (skills: UserSkill[], ids: string[]) => skills.find(({ skill }) => ids.includes(skill.id))
const clock = (hours: number[]) => hours.map((hour) => `${String(hour).padStart(2, '0')}:00`).join(', ')

// "Mon & Wed · 10:00, 11:00" when the shared hours repeat across days, else each day with its own hours.
function describeShared(theirs: WeeklyAvailability, yours: WeeklyAvailability | null) {
  const yourKeys = new Set(yours?.slots.map(slotKey) ?? [])
  const byDay = WEEKDAYS.map((day) => ({
    day: day.short,
    hours: theirs.slots.filter((slot) => slot.day === day.id && yourKeys.has(slotKey(slot))).map((slot) => slot.startHour).sort((a, b) => a - b),
  })).filter(({ hours }) => hours.length > 0)
  if (byDay.length === 0) return null
  const sameHours = byDay.every(({ hours }) => clock(hours) === clock(byDay[0].hours))
  return sameHours ? `${byDay.map(({ day }) => day).join(' & ')} · ${clock(byDay[0].hours)}` : byDay.map(({ day, hours }) => `${day} ${clock(hours)}`).join('; ')
}

// The deal between the viewer and this member, as the page's dark card with both faces. With a session already
// booked, the note leads with that session (Join once it opens) and booking again drops to a quiet link.
export default function ExchangeNote({ profile, theirWeek, yourWeek, credits, walletStatus, onRetryWallet, onRequest }: ExchangeNoteProps) {
  const me = useCurrentUser()
  const { peer, swapType, teachesYou, learnsFromYou, nextSession, hasPendingRequest } = profile
  const now = useNow(30_000)
  const firstName = peer.name.split(' ')[0]
  const isFree = swapType === 'two_way'
  const youLearn = findSkill(peer.teachSkills, teachesYou)
  const theyLearn = findSkill(peer.learnSkills, learnsFromYou)
  const shared = describeShared(theirWeek, yourWeek)
  const isOutOfCredits = !isFree && credits === 0
  // A credit booking needs a known balance, so booking waits for the wallet.
  const canBook = Boolean(youLearn) && (isFree || walletStatus === 'ready') && !isOutOfCredits
  const msToStart = nextSession ? Date.parse(nextSession.startsAt) - now : null
  const isJoinable = nextSession !== null && getJoinState(nextSession, now) === 'open'
  const isSoon = msToStart !== null && msToStart > 0 && msToStart <= SOON_MS

  // Request, not book: the other member still accepts, and the form and its send button say the same.
  const bookLabel = isFree ? 'Request a free swap' : 'Request a session · 1 credit'
  const mainAction = hasPendingRequest ? (
    <Link to={`/messages?peer=${peer.id}`} className={getButtonClasses('onNext')}>View your request</Link>
  ) : nextSession ? (
    isJoinable ? (
      <JoinMeetingButton session={nextSession} now={now} variant="onNext" partnerName={firstName} />
    ) : (
      <Link to="/sessions" className={getButtonClasses('onNext')}>View in Sessions</Link>
    )
  ) : isOutOfCredits ? null : (
    <Button variant="onNext" onClick={onRequest} disabled={!canBook}>{bookLabel}</Button>
  )

  return (
    <section aria-labelledby="exchange-heading" className="rounded-3xl bg-next p-5 text-white/75 sm:p-7">
      <h2 id="exchange-heading" className="sr-only">Your exchange with {firstName}</h2>
      {/* The two people and the swap between them, said as one line ("Spanish for Python, with Bea"). */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <SwapPair me={me} partner={peer} size="lg" ringClass="ring-next" />
        <div className="min-w-0">
          <p className="font-display text-2xl font-semibold text-balance text-white">
            {!youLearn ? `${firstName} hasn't listed a skill you want yet` : isFree && theyLearn ? `${youLearn.skill.name} for ${theyLearn.skill.name}, with ${firstName}` : `Learning ${youLearn.skill.name} from ${firstName}`}
          </p>
          <p className="mt-1 text-sm">
            {youLearn && <>{firstName} is {PROFICIENCY_LABELS[youLearn.proficiency].toLowerCase()} · </>}
            {isFree ? 'an hour each' : credits === null ? '1 credit an hour' : <>1 credit an hour · <span className="figures">{credits}</span> in your wallet</>}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:gap-5">
        {mainAction}
        <div className="space-y-0.5 text-sm">
          {nextSession && (
            <p className="font-medium text-white">
              {isJoinable ? 'Open now' : isSoon ? `Starts in ${Math.ceil(msToStart / 60_000)} min` : 'Next session'}
              {' · '}<span className="figures font-normal">{formatSlotDateTime(nextSession.startsAt)}</span>
            </p>
          )}
          {isOutOfCredits && (
            <p>
              No credits. <NoteLink to="/explore?type=2way">Find a free swap</NoteLink> or <NoteLink to="/settings?tab=skills">add skills to teach</NoteLink>.
            </p>
          )}
          <p>{shared ? <>You're both free <span className="figures">{shared}</span></> : 'No shared hours yet'}</p>
          {nextSession && !hasPendingRequest && !isOutOfCredits && (
            <p>
              <button type="button" onClick={onRequest} disabled={!canBook} className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-4 font-medium text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60 lg:min-h-9">
                Request another session{isFree ? '' : ' · 1 credit'}
              </button>
            </p>
          )}
          {!isFree && walletStatus === 'error' && (
            <p>
              Balance didn't load.{' '}
              <button type="button" onClick={onRetryWallet} className="rounded font-medium text-white underline outline-none focus-visible:ring-2 focus-visible:ring-white">Retry</button>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
