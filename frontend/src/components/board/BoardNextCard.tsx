import { useNow } from '../../hooks/useNow'
import type { UpcomingSession } from '../../types'
import { getJoinState, JOIN_WINDOW_MINUTES } from '../../utils/sessions'
import { formatSlotTime, getSlotEnd } from '../../utils/timeSlots'
import Avatar from '../common/Avatar'
import JoinMeetingButton from '../schedule/JoinMeetingButton'
import { swapTitle } from '../schedule/sessionLabels'

interface BoardNextCardProps {
  session: UpcomingSession & { returnSkillName?: string | null }
  className?: string
}

// The session starting soon as the board's pinned yellow card: the minutes left lead, then the swap, then Join.
// The minutes update quietly every 15 seconds, so nothing ticks for attention.
export default function BoardNextCard({ session, className = '' }: BoardNextCardProps) {
  const now = useNow(15_000)
  const msUntilStart = Date.parse(session.startsAt) - now
  const minutes = Math.max(Math.ceil(msUntilStart / 60_000), 1)
  const firstName = session.partner.name.split(' ')[0]

  return (
    <section id="starting-soon" tabIndex={-1} aria-labelledby="next-heading" className={`relative flex flex-col rounded-2xl bg-sun p-6 pt-8 text-ink shadow-[0_10px_24px_-12px_rgb(27_29_34/0.4)] outline-none ${className}`}>
      {/* The pin straddles the top edge, with a highlight and a short cast shadow: the board's mark on its most important card. */}
      <span aria-hidden="true" className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ff9b7a,#ff6a3d_45%,#b8401c)] shadow-[0_3px_4px_rgb(27_29_34/0.35)]" />
      {/* The heading stays a heading; the timer role sits on its text, so the countdown is both. */}
      <h2 id="next-heading" className="font-display text-4xl leading-none font-bold tracking-tight">
        <span role="timer">{msUntilStart > 0 ? <>Starts in <span className="figures">{minutes}</span> min</> : 'In progress'}</span>
      </h2>
      <p className="mt-4 font-display text-xl leading-snug font-semibold text-balance">
        {swapTitle({ partnerName: session.partner.name, skillName: session.skillName, returnSkillName: session.returnSkillName, isTeaching: session.isTeaching })}
      </p>
      <p className="mt-3 flex items-center gap-2.5 text-sm">
        <Avatar name={session.partner.name} url={session.partner.avatarUrl} size="xs" />
        <span className="figures">Today {formatSlotTime(session.startsAt)}–{formatSlotTime(getSlotEnd(session.startsAt))}</span>
      </p>
      <div className="mt-auto pt-6">
        {getJoinState(session, now) === 'open' ? (
          <JoinMeetingButton session={session} now={now} partnerName={firstName} className="w-full sm:w-auto" />
        ) : (
          <p className="text-sm font-medium">Join opens {JOIN_WINDOW_MINUTES} min before.</p>
        )}
      </div>
    </section>
  )
}
