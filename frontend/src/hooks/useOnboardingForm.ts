import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../services/onboardingService'
import { useAuth } from './useAuth'
import type { Skill, Proficiency, TimeSlot, UserSkill } from '../types'
import { getViewerTimezone, slotKey } from '../utils/availability'

export type OnboardingStep = 1 | 2 | 3

export const SUBMIT_ERROR = "We couldn't finish your setup. Your answers are safe, so please try again."

const addSkill = (list: UserSkill[], skill: Skill, proficiency: Proficiency) => [
  ...list,
  { skill, proficiency },
]

const removeSkill = (list: UserSkill[], skillId: string) =>
  list.filter(({ skill }) => skill.id !== skillId)

// Answers live here rather than in each step, so moving back and forward never loses them.
export function useOnboardingForm() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [teachSkills, setTeachSkills] = useState<UserSkill[]>([])
  const [learnSkills, setLearnSkills] = useState<UserSkill[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canContinue =
    (step === 1 && teachSkills.length > 0) ||
    (step === 2 && learnSkills.length > 0) ||
    (step === 3 && slots.length > 0)

  // Functional update: a mouse drag can change several slots between renders.
  function setSlot(slot: TimeSlot, isSelected: boolean) {
    setSlots((current) => {
      const others = current.filter((item) => slotKey(item) !== slotKey(slot))
      return isSelected ? [...others, slot] : others
    })
  }

  async function submit() {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await completeOnboarding({
        teachSkills,
        learnSkills,
        availability: { timezone: getViewerTimezone(), slots },
      })
      // Update the member first: AuthGate sends onboarded members away from /onboarding, and must
      // already see the change when the dashboard loads.
      updateUser({ isOnboarded: true })
      navigate('/dashboard', { replace: true })
    } catch {
      setSubmitError(SUBMIT_ERROR)
      setIsSubmitting(false)
    }
  }

  return {
    step,
    teachSkills,
    learnSkills,
    slots,
    isSubmitting,
    submitError,
    canContinue,
    setSlot,
    submit,
    goBack: () => setStep((current) => (current === 3 ? 2 : 1)),
    goNext: () => setStep((current) => (current === 1 ? 2 : 3)),
    addTeachSkill: (skill: Skill, level: Proficiency) =>
      setTeachSkills((current) => addSkill(current, skill, level)),
    removeTeachSkill: (id: string) => setTeachSkills((current) => removeSkill(current, id)),
    addLearnSkill: (skill: Skill, level: Proficiency) =>
      setLearnSkills((current) => addSkill(current, skill, level)),
    removeLearnSkill: (id: string) => setLearnSkills((current) => removeSkill(current, id)),
  }
}
