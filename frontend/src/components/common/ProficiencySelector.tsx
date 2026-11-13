import { useId } from 'react'
import type { Proficiency } from '../../types'
import { PROFICIENCY_LABELS } from '../../utils/skills'

interface ProficiencySelectorProps {
  legend: string
  value: Proficiency
  onChange: (value: Proficiency) => void
}

const LEVELS = Object.keys(PROFICIENCY_LABELS) as Proficiency[]

export default function ProficiencySelector({ legend, value, onChange }: ProficiencySelectorProps) {
  const groupName = useId()
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-line bg-surface p-1">
        {LEVELS.map((level) => (
          <label
            key={level}
            className={`flex min-h-10 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-accent ${level === value ? 'bg-next text-white' : 'text-muted hover:bg-canvas hover:text-ink'}`}
          >
            <input
              type="radio"
              name={groupName}
              checked={level === value}
              onChange={() => onChange(level)}
              className="sr-only"
            />
            {PROFICIENCY_LABELS[level]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
