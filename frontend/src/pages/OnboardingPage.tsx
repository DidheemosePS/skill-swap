import { useEffect, useRef } from 'react'
import SwapCard from '../components/cards/SwapCard'
import AlertBanner from '../components/common/AlertBanner'
import Button from '../components/common/Button'
import SkillSelector from '../components/common/SkillSelector'
import StepIndicator from '../components/common/StepIndicator'
import AvailabilityPicker from '../components/schedule/AvailabilityPicker'
import { useCurrentUser } from '../hooks/useAuth'
import { useOnboardingForm } from '../hooks/useOnboardingForm'
import { useSkills } from '../hooks/useSkills'
import { getViewerTimezone, summarizeAvailability } from '../utils/availability'

const STEP_LABELS = ['Teach', 'Learn', 'Availability']

const STEP_COPY = {
  1: { title: 'What can you teach?', intro: 'Add the skills you could teach in a one-hour session.', hint: 'Add at least one skill to continue.' },
  2: { title: 'What do you want to learn?', intro: 'Add the skills you want and the level you are aiming for.', hint: 'Add at least one skill to continue.' },
  3: { title: 'When are you free each week?', intro: 'Select every hour you could usually meet.', hint: 'Select at least one hour to continue.' },
}

export default function OnboardingPage() {
  const user = useCurrentUser()
  const form = useOnboardingForm()
  const { skills, status, retry } = useSkills()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isFirstStep = useRef(true)
  const copy = STEP_COPY[form.step]

  // Move focus to the new heading so keyboard and screen reader users follow the step change.
  useEffect(() => {
    if (isFirstStep.current) isFirstStep.current = false
    else headingRef.current?.focus()
  }, [form.step])

  const sharedSelectorProps = { skills, status, onRetry: retry }

  return (
    <main className={`mx-auto w-full px-4 py-8 sm:py-12 ${form.step === 3 ? 'max-w-5xl' : 'max-w-2xl'}`}>
      <title>Set up your profile · Skill Swap</title>
      <p className="mb-8 font-semibold">Skill Swap</p>
      <StepIndicator steps={STEP_LABELS} current={form.step} />

      <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-semibold text-balance outline-none sm:text-3xl">
        {copy.title}
      </h1>
      <p className="mt-2 mb-6 text-muted">{copy.intro}</p>

      {/* The key resets the selector's proficiency and search between the two skill steps. */}
      {form.step === 1 && (
        <SkillSelector
          key="teach"
          {...sharedSelectorProps}
          selected={form.teachSkills}
          blockedSkills={form.learnSkills}
          blockedReason="On your learn list"
          levelLegend="Your level"
          emptyMessage="No teaching skills yet. Search above to add your first."
          onAdd={form.addTeachSkill}
          onRemove={form.removeTeachSkill}
        />
      )}
      {form.step === 2 && (
        <SkillSelector
          key="learn"
          {...sharedSelectorProps}
          selected={form.learnSkills}
          blockedSkills={form.teachSkills}
          blockedReason="You teach this"
          levelLegend="Level you are aiming for"
          emptyMessage="No learning goals yet. Search above to add your first."
          onAdd={form.addLearnSkill}
          onRemove={form.removeLearnSkill}
        />
      )}
      {form.step === 3 && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div>
            <AvailabilityPicker selected={form.slots} onSlotChange={form.setSlot} />
            <p className="mt-3 text-sm text-muted">Times shown in {getViewerTimezone()}.</p>
          </div>
          <aside className="space-y-4">
            <h2 className="text-sm font-semibold">Your Swap Card preview</h2>
            <SwapCard
              name={user.name}
              avatarUrl={user.avatarUrl}
              teachSkills={form.teachSkills}
              learnSkills={form.learnSkills}
              availabilitySummary={summarizeAvailability(form.slots)}
            />
            <p className="rounded-lg bg-accent-soft p-4 text-sm font-medium text-accent-strong">
              <span aria-hidden="true">🎁 </span>Complete onboarding to claim 1 free credit
            </p>
          </aside>
        </div>
      )}

      {form.submitError && (
        <div className="mt-6">
          <AlertBanner message={form.submitError} />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        {form.step > 1 ? (
          <Button variant="secondary" onClick={form.goBack} disabled={form.isSubmitting}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          <p aria-live="polite" className="text-right text-sm text-muted">
            {form.canContinue ? '' : copy.hint}
          </p>
          {form.step < 3 ? (
            <Button onClick={form.goNext} disabled={!form.canContinue} className="shrink-0">
              Next
            </Button>
          ) : (
            <Button onClick={form.submit} disabled={!form.canContinue} isLoading={form.isSubmitting} className="shrink-0">
              {form.isSubmitting ? 'Finishing setup…' : 'Complete setup'}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
