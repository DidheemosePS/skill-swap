import type { UserSkill } from '../../types'
import { PROFICIENCY_LABELS } from '../../utils/skills'

interface SkillMatrixProps {
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
  // Skill ids in common with the viewer, marked so the reason for the deal is visible here too.
  teachesYou?: string[]
  learnsFromYou?: string[]
}

function SkillList({ title, skills, shared, sharedNote, emptyText }: { title: string; skills: UserSkill[]; shared: string[]; sharedNote: string; emptyText: string }) {
  return (
    <section>
      <h3 className="text-xs font-semibold text-muted">{title}</h3>
      {skills.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-1 divide-y divide-line/60">
          {skills.map(({ skill, proficiency }) => (
            <li key={skill.id} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
              <span className={shared.includes(skill.id) ? 'font-medium underline decoration-muted underline-offset-4' : 'font-medium'}>{skill.name}</span>
              <span className="text-sm text-muted">
                {PROFICIENCY_LABELS[proficiency]}
                {shared.includes(skill.id) && <span className="text-muted"> · {sharedNote}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// What they teach and want, as two ruled lists with levels; skills matching the viewer are underlined.
export default function SkillMatrix({ teachSkills, learnSkills, teachesYou = [], learnsFromYou = [] }: SkillMatrixProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SkillList title="Teaches" skills={teachSkills} shared={teachesYou} sharedNote="on your list" emptyText="No teaching skills listed yet." />
      <SkillList title="Wants to learn" skills={learnSkills} shared={learnsFromYou} sharedNote="you teach this" emptyText="No learning goals listed yet." />
    </div>
  )
}
