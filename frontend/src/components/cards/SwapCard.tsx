import type { UserSkill } from '../../types'
import { formatUserSkill } from '../../utils/skills'
import Avatar from '../common/Avatar'
import Badge from '../common/Badge'

interface SwapCardProps {
  name: string
  avatarUrl: string | null
  teachSkills: UserSkill[]
  learnSkills: UserSkill[]
  availabilitySummary: string
}

function SkillGroup({ title, skills }: { title: string; skills: UserSkill[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted">{title}</h4>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {skills.map((item) => (
          <li key={item.skill.id}>
            <Badge label={formatUserSkill(item)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SwapCard({ name, avatarUrl, teachSkills, learnSkills, availabilitySummary }: SwapCardProps) {
  return (
    <article className="space-y-4 rounded-xl bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar name={name} url={avatarUrl} />
        <h3 className="font-semibold">{name}</h3>
      </div>
      <SkillGroup title="Can teach" skills={teachSkills} />
      <SkillGroup title="Wants to learn" skills={learnSkills} />
      <p className="border-t border-line pt-4 text-sm text-muted">{availabilitySummary}</p>
    </article>
  )
}
