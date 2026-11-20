import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../common/Avatar'
import SwapPair from '../common/SwapPair'
import { getButtonClasses } from '../common/buttonStyles'
import type { DemoMatch } from '../../data/landingDemo'

interface DemoResultProps {
  teach: string | null
  learn: string | null
  match: DemoMatch | null
  // True when both sides name the same skill, which the product also blocks.
  clash: boolean
}

// The visitor beside an open seat: the shape of MatchFeedEmpty, so the idle demo
// already looks like the product waiting for a partner.
function OpenPair() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center">
      <span className="rounded-full ring-[3px] ring-surface">
        <Avatar name="You" url={null} size="md" />
      </span>
      <span className="relative z-10 -mx-2 grid size-6 place-items-center rounded-full bg-white text-ink ring-[3px] ring-surface">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
          <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />
        </svg>
      </span>
      <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-dashed border-line text-lg font-semibold text-faint ring-[3px] ring-surface">?</span>
    </span>
  )
}

const tagClasses = 'inline-flex items-center rounded-sm border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted'

// The demo's answer card. aria-live sits on the stable wrapper so pick changes are
// announced; the key on the inner div restarts the entrance animation per new match.
export default function DemoResult({ teach, learn, match, clash }: DemoResultProps) {
  const { user } = useAuth()
  const settled = teach !== null && learn !== null && !clash && match !== null
  return (
    <div aria-live="polite" className="min-h-44 rounded-2xl bg-surface p-5">
      {!settled ? (
        <div className="flex items-start gap-3.5">
          <OpenPair />
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-ink">Your match appears here</p>
            <p className="mt-1.5 text-sm text-muted">
              {teach ? 'Now pick a skill you want to learn.' : learn ? 'Now pick a skill you can teach.' : 'Pick one skill on each side to see who you’d match with.'}
            </p>
          </div>
        </div>
      ) : (
        <div key={`${teach}-${learn}`} className="flex flex-col gap-3 motion-safe:animate-[rise_0.35s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className={tagClasses}>{match.kind === 'open' ? 'How it would work' : 'Example match'}</span>
            {match.kind === 'mutual' && <span className="inline-flex items-center rounded-sm bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">Free swap</span>}
            {match.kind === 'credit' && <span className={`${tagClasses} figures`}>1 credit an hour</span>}
          </div>
          <div className="flex items-start gap-3.5">
            {match.kind === 'open' ? (
              <OpenPair />
            ) : (
              <SwapPair me={{ name: 'You', avatarUrl: null }} partner={{ name: match.partner.name, avatarUrl: null }} size="md" />
            )}
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <p className="font-display text-lg font-semibold text-ink">
                {match.kind === 'open' ? `You ↔ whoever teaches ${learn}` : `You ↔ ${match.partner.name}`}
              </p>
              <p className="mt-1.5 text-sm text-muted">
                {match.kind === 'mutual' && (
                  <>
                    {match.partner.name} teaches you <strong>{learn}</strong>; you teach {match.partner.name} <strong>{teach}</strong>. An hour for an hour (<span className="figures">1 h ↔ 1 h</span>), no credits involved.
                  </>
                )}
                {match.kind === 'credit' && (
                  <>
                    {match.partner.name} teaches you <strong>{learn}</strong> for <span className="figures">1</span> credit an hour. {match.partner.line}.
                  </>
                )}
                {match.kind === 'open' && (
                  <>
                    No one in this sample teaches <strong>{learn}</strong> yet. On Skill Swap you’d list it as a skill you want, and you’re matched the moment someone who teaches it joins.
                  </>
                )}
              </p>
              <p className="mt-2 text-[0.8125rem] text-muted">
                {match.kind === 'mutual' && `${match.partner.line}.`}
                {match.kind === 'credit' &&
                  (match.student ? `${match.student.name} wants to learn ${teach}. Teach them an hour to earn that credit.` : `Teach ${teach} to anyone interested. Every taught hour earns a credit.`)}
                {match.kind === 'open' &&
                  (match.student ? `Meanwhile: ${match.student.name} wants to learn ${teach} from you. Teaching earns credits to spend on any mentor.` : `Meanwhile, teaching ${teach} earns credits to spend on any mentor.`)}
              </p>
            </div>
          </div>
          <Link to={user ? '/dashboard' : '/login'} className={getButtonClasses('primary', 'self-start')}>
            {user ? 'Find a real match' : 'Create your profile'}
          </Link>
        </div>
      )}
    </div>
  )
}
