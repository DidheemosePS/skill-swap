import { useState } from 'react'
import type { FormEvent } from 'react'

interface SkillPickerProps {
  label: string
  inputId: string
  suggestions: string[]
  placeholder: string
  value: string | null
  onChange: (skill: string | null) => void
}

const norm = (skill: string) => skill.trim().toLowerCase()
const titleCase = (skill: string) =>
  skill.trim().replace(/\s+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())

// One side of the demo: suggestion chips that act as a single-select, plus a free-text
// field so any skill works. A typed skill that isn't a suggestion becomes its own
// pressed chip, so clearing it works the same way as clearing a suggestion.
export default function SkillPicker({ label, inputId, suggestions, placeholder, value, onChange }: SkillPickerProps) {
  const [draft, setDraft] = useState('')
  const isCustom = value !== null && !suggestions.some((skill) => norm(skill) === norm(value))

  function submitDraft(event: FormEvent) {
    event.preventDefault()
    if (draft.trim()) {
      onChange(titleCase(draft))
      setDraft('')
    }
  }

  const chipClasses = (pressed: boolean) =>
    `min-h-11 rounded-lg border px-3.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 lg:min-h-9 ${
      pressed ? 'border-next bg-next font-semibold text-white' : 'border-line bg-surface font-medium text-ink hover:bg-canvas'
    }`

  return (
    <div>
      <label className="text-sm font-semibold text-ink" htmlFor={inputId}>
        {label}
      </label>
      <div role="group" aria-label={label} className="mt-2.5 flex flex-wrap gap-2">
        {suggestions.map((skill, index) => {
          const pressed = value !== null && norm(skill) === norm(value)
          // Phones show one row of three, so the demo doesn't push the next section off screen two.
          const phoneHidden = index >= 3 && !pressed ? 'max-sm:hidden' : ''
          return (
            <button key={skill} type="button" aria-pressed={pressed} className={`${chipClasses(pressed)} ${phoneHidden}`} onClick={() => onChange(pressed ? null : skill)}>
              {skill}
            </button>
          )
        })}
        {isCustom && (
          <button type="button" aria-pressed="true" className={chipClasses(true)} onClick={() => onChange(null)}>
            {value}
          </button>
        )}
      </div>
      {/* A one-field form submits on Enter by itself, so no Set button competes with the hero's actions;
          browsers also skip that submit while an input method is composing. */}
      <form className="mt-2.5 flex gap-2" onSubmit={submitDraft}>
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-base text-ink outline-none placeholder:text-faint focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 sm:text-sm"
          enterKeyHint="done"
        />
      </form>
    </div>
  )
}
