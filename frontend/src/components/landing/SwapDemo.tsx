import { useMemo, useState } from 'react'
import { LEARN_SUGGESTIONS, TEACH_SUGGESTIONS, matchDemo } from '../../data/landingDemo'
import DemoResult from './DemoResult'
import SkillPicker from './SkillPicker'

const norm = (skill: string) => skill.trim().toLowerCase()

// The hero's proof: a visitor tries the matching mechanic with no account. State is
// just the two picked skills; the match itself is derived, so result and pickers can
// never disagree.
export default function SwapDemo() {
  const [teach, setTeach] = useState<string | null>(null)
  const [learn, setLearn] = useState<string | null>(null)

  const clash = teach !== null && learn !== null && norm(teach) === norm(learn)
  const match = useMemo(
    () => (teach !== null && learn !== null && !clash ? matchDemo(teach, learn) : null),
    [teach, learn, clash],
  )

  return (
    <section aria-labelledby="demo-heading" className="flex min-w-0 flex-col gap-4 rounded-3xl bg-card p-5 text-ink sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        {/* A label, not an h2: the demo sits inside the hero, and the page's h2s are its sections. */}
        <p id="demo-heading" className="font-display text-xl font-semibold">
          Try a swap
        </p>
        <span className="inline-flex items-center rounded-sm border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">No account needed</span>
      </div>

      <SkillPicker
        label="You can teach"
        inputId="demo-teach"
        suggestions={TEACH_SUGGESTIONS}
        placeholder="Any skill, like pottery, then Enter"
        value={teach}
        onChange={setTeach}
      />

      <div aria-hidden="true" className="flex items-center gap-3 text-faint">
        <span className="flex-1 border-t border-line" />
        <span className="grid size-7 place-items-center rounded-full border border-line bg-surface text-ink">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
            <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />
          </svg>
        </span>
        <span className="flex-1 border-t border-line" />
      </div>

      <SkillPicker
        label="You want to learn"
        inputId="demo-learn"
        suggestions={LEARN_SUGGESTIONS}
        placeholder="Any skill, like French, then Enter"
        value={learn}
        onChange={setLearn}
      />

      {clash && <p className="text-sm text-danger">Pick two different skills. You already teach that one.</p>}

      <DemoResult teach={teach} learn={learn} match={match} clash={clash} />
    </section>
  )
}
