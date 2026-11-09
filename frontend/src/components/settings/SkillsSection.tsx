import { useSkills } from '../../hooks/useSkills'
import type { Proficiency, ProfileSettings, Skill, UserSkill } from '../../types'
import SkillSelector from '../common/SkillSelector'

interface SkillsSectionProps {
  draft: ProfileSettings
  onChange: (patch: Partial<ProfileSettings>) => void
}

const withSkill = (list: UserSkill[], skill: Skill, proficiency: Proficiency) => [...list, { skill, proficiency }]
const withoutSkill = (list: UserSkill[], skillId: string) => list.filter(({ skill }) => skill.id !== skillId)

export default function SkillsSection({ draft, onChange }: SkillsSectionProps) {
  const { skills, status, retry } = useSkills()
  const shared = { skills, status, onRetry: retry }
  const { teachSkills, learnSkills } = draft

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section aria-labelledby="teach-heading">
        <h2 id="teach-heading" className="font-semibold">Skills you teach</h2>
        <p className="mt-1 mb-4 text-sm text-muted">Members who want these skills see you in their matches.</p>
        <SkillSelector
          {...shared}
          selected={teachSkills}
          blockedSkills={learnSkills}
          blockedReason="On your learn list"
          levelLegend="Your level"
          emptyMessage="No teaching skills. Add at least one."
          onAdd={(skill, level) => onChange({ teachSkills: withSkill(teachSkills, skill, level) })}
          onRemove={(id) => onChange({ teachSkills: withoutSkill(teachSkills, id) })}
        />
      </section>
      <section aria-labelledby="learn-heading">
        <h2 id="learn-heading" className="font-semibold">Skills you want to learn</h2>
        <p className="mt-1 mb-4 text-sm text-muted">The level is the one you're aiming for.</p>
        <SkillSelector
          {...shared}
          selected={learnSkills}
          blockedSkills={teachSkills}
          blockedReason="You teach this"
          levelLegend="Level you are aiming for"
          emptyMessage="No learning goals. Add at least one."
          onAdd={(skill, level) => onChange({ learnSkills: withSkill(learnSkills, skill, level) })}
          onRemove={(id) => onChange({ learnSkills: withoutSkill(learnSkills, id) })}
        />
      </section>
    </div>
  )
}
