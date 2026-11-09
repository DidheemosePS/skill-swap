import type { UserSkill } from '../../types'
import { formatUserSkill } from '../../utils/skills'
import Badge from '../common/Badge'

interface SkillMatrixProps {
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
}

function SkillBox({ title, skills, emptyText }: { title: string; skills: UserSkill[]; emptyText: string }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      {skills.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {skills.map((item) => (
            <li key={item.skill.id} className="max-w-full">
              <Badge label={formatUserSkill(item)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function SkillMatrix({ teachSkills, learnSkills }: SkillMatrixProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SkillBox title="Skills They Can Teach" skills={teachSkills} emptyText="No teaching skills listed yet." />
      <SkillBox title="Skills They Want to Learn" skills={learnSkills} emptyText="No learning goals listed yet." />
    </div>
  )
}
