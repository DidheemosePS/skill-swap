import { useState } from 'react'
import type { SkillsStatus } from '../../hooks/useSkills'
import type { Proficiency, Skill, UserSkill } from '../../types'
import { formatUserSkill } from '../../utils/skills'
import AlertBanner from './AlertBanner'
import Badge from './Badge'
import ProficiencySelector from './ProficiencySelector'
import SkillCombobox from './SkillCombobox'
import Skeleton from './Skeleton'

interface SkillSelectorProps {
  skills: Skill[]
  status: SkillsStatus
  onRetry: () => void
  selected: UserSkill[]
  // Skills chosen in the opposite list: a member can't both teach and learn the same skill.
  blockedSkills: UserSkill[]
  blockedReason: string
  levelLegend: string
  emptyMessage: string
  onAdd: (skill: Skill, proficiency: Proficiency) => void
  onRemove: (skillId: string) => void
}

export default function SkillSelector({
  skills,
  status,
  onRetry,
  selected,
  blockedSkills,
  blockedReason,
  levelLegend,
  emptyMessage,
  onAdd,
  onRemove,
}: SkillSelectorProps) {
  const [proficiency, setProficiency] = useState<Proficiency>('intermediate')
  const selectedIds = new Set(selected.map(({ skill }) => skill.id))
  // Custom skills from the opposite list aren't in the catalog, but they must still show as blocked.
  const blockedCustom = blockedSkills.flatMap(({ skill }) => (skill.isCustom ? [skill] : []))
  const available = [...skills, ...blockedCustom].filter((skill) => !selectedIds.has(skill.id))
  const blocked = new Map(blockedSkills.map(({ skill }) => [skill.id, blockedReason]))

  return (
    <div className="space-y-5">
      <ProficiencySelector legend={levelLegend} value={proficiency} onChange={setProficiency} />

      {status === 'loading' && (
        <div role="status" aria-label="Loading skills" className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11" />
        </div>
      )}
      {status === 'error' && <AlertBanner message="We couldn't load the skill list." onRetry={onRetry} />}
      {status === 'ready' && (
        <SkillCombobox
          label="Search skills"
          placeholder="Try Python, Spanish or Guitar"
          skills={available}
          blocked={blocked}
          addedSkills={selected.map(({ skill }) => skill)}
          onSelect={(skill) => onAdd(skill, proficiency)}
        />
      )}

      {/* The empty prompt points at the search box, so it's hidden when the search can't load. */}
      {selected.length === 0 && status !== 'error' && (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          {emptyMessage}
        </p>
      )}
      {selected.length > 0 && (
        <ul aria-label="Added skills" className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <li key={item.skill.id}>
              <Badge label={formatUserSkill(item)} onRemove={() => onRemove(item.skill.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
