import { useSkills } from '../../hooks/useSkills'
import type { Proficiency, ProfileSettings, Skill, UserSkill } from '../../types'
import SkillSelector from '../common/SkillSelector'
import SettingsPanel from './SettingsPanel'

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
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <SettingsPanel id="teach-heading" title="You teach" hint="Shown to people learning these.">
        <SkillSelector
          {...shared}
          selected={teachSkills}
          blockedSkills={learnSkills}
          blockedReason="On your learn list"
          levelLegend="Your level"
          emptyMessage="Add at least one."
          onAdd={(skill, level) => onChange({ teachSkills: withSkill(teachSkills, skill, level) })}
          onRemove={(id) => onChange({ teachSkills: withoutSkill(teachSkills, id) })}
        />
      </SettingsPanel>
      <SettingsPanel id="learn-heading" title="You want to learn" hint="Pick the level you're aiming for.">
        <SkillSelector
          {...shared}
          selected={learnSkills}
          blockedSkills={teachSkills}
          blockedReason="You teach this"
          levelLegend="Target level"
          emptyMessage="Add at least one."
          onAdd={(skill, level) => onChange({ learnSkills: withSkill(learnSkills, skill, level) })}
          onRemove={(id) => onChange({ learnSkills: withoutSkill(learnSkills, id) })}
        />
      </SettingsPanel>
    </div>
  )
}
