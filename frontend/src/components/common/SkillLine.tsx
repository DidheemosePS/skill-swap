import Badge from './Badge'

interface SkillLineProps {
  label: string
  names: string[]
}

export default function SkillLine({ label, names }: SkillLineProps) {
  if (names.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {names.map((name) => (
        <Badge key={name} label={name} />
      ))}
    </div>
  )
}
