import { useCurrentUser } from '../../hooks/useAuth'
import { useNow } from '../../hooks/useNow'
import type { UpcomingSession } from '../../types'
import { getJoinState, JOIN_WINDOW_MINUTES } from '../../utils/sessions'
import { formatSlotTime, getSlotEnd } from '../../utils/timeSlots'
import SwapPair from '../common/SwapPair'
import { swapTitle } from './sessionLabels'
import JoinMeetingButton from './JoinMeetingButton'

interface StartingSoonStripProps {
  // The return skill, when known, lets a free swap name both sides ("Python for Spanish, with Bea").
  session: UpcomingSession & { returnSkillName?: string | null }
}

// The one thing happening now, as the page's dark card: the two people, the swap, when, and Join. The time is
// said in minutes and updates quietly, so nothing ticks for attention.
export default function StartingSoonStrip({ session }: StartingSoonStripProps) {
  const me = useCurrentUser()
  const now = useNow(15_000)
  const msUntilStart = Date.parse(session.startsAt) - now
  const minutes = Math.max(Math.ceil(msUntilStart / 60_000), 1)
  const joinState = getJoinState(session, now)
  const firstName = session.partner.name.split(' ')[0]

  return (
    <section
      id="starting-soon"
      tabIndex={-1}
      aria-labelledby="starting-soon-heading"
      className="flex flex-col gap-5 rounded-3xl bg-next px-5 py-6 text-white outline-none sm:flex-row sm:items-center sm:gap-6 sm:px-7"
    >
      <SwapPair me={me} partner={session.partner} size="lg" ringClass="ring-next" />
      <div className="min-w-0 flex-1">
        <p role="timer" aria-label={`Time until your session with ${firstName}`} className="text-sm text-white/70">
          {msUntilStart > 0 ? <>Starts in <span className="figures">{minutes}</span> min</> : 'In progress'}
        </p>
        <h2 id="starting-soon-heading" className="mt-0.5 text-2xl font-semibold text-balance">
          {swapTitle({ partnerName: session.partner.name, skillName: session.skillName, returnSkillName: session.returnSkillName, isTeaching: session.isTeaching })}
        </h2>
        <p className="figures mt-1 text-sm text-white/70">Today {formatSlotTime(session.startsAt)}–{formatSlotTime(getSlotEnd(session.startsAt))}</p>
      </div>
      {joinState === 'open' ? (
        <JoinMeetingButton session={session} now={now} partnerName={firstName} variant="onNext" className="w-full shrink-0 sm:w-auto" />
      ) : (
        <p className="text-sm text-white/70">Join opens {JOIN_WINDOW_MINUTES} min before.</p>
      )}
    </section>
  )
}
