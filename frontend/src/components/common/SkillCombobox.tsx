import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Skill } from '../../types'
import {
  cleanSkillName,
  createCustomSkill,
  isValidSkillName,
  MAX_SKILL_NAME_LENGTH,
  skillNameKey,
} from '../../utils/skills'

interface SkillComboboxProps {
  label: string
  placeholder: string
  skills: Skill[]
  // Skills that stay visible but can't be picked, mapped to the reason shown beside them.
  blocked: Map<string, string>
  // Skills already on this list; they aren't offered, but they can't be added again as custom.
  addedSkills: Skill[]
  onSelect: (skill: Skill) => void
}

function getEmptyMessage(searchName: string, isAlreadyAdded: boolean) {
  if (isAlreadyAdded) return `“${searchName}” is already on your list.`
  if (searchName) return `“${searchName}” isn't a valid skill name.`
  return 'You have added every available skill.'
}

// Implements the ARIA combobox pattern: focus stays in the input while arrows move the highlight.
export default function SkillCombobox({ label, placeholder, skills, blocked, addedSkills, onSelect }: SkillComboboxProps) {
  const baseId = useId()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const searchKey = skillNameKey(query)
  const searchName = cleanSkillName(query)
  const matches = skills.filter((skill) => skillNameKey(skill.name).includes(searchKey))
  const hasSameName = (skill: Skill) => skillNameKey(skill.name) === searchKey
  const isAlreadyAdded = addedSkills.some(hasSameName)
  // Partial matches still allow a custom skill, so "Java" can be added while "JavaScript" is listed.
  const customSkill =
    isValidSkillName(searchName) && !isAlreadyAdded && !skills.some(hasSameName)
      ? createCustomSkill(searchName)
      : null
  // The custom option joins the same list, so arrow keys and Enter treat it like any other.
  const selectable = [
    ...matches.filter((skill) => !blocked.has(skill.id)),
    ...(customSkill ? [customSkill] : []),
  ]
  const active = isOpen ? selectable[activeIndex] : undefined
  const optionId = (skill: Skill) => `${baseId}-${skill.id}`

  function select(skill: Skill) {
    onSelect(skill)
    setQuery('')
    setActiveIndex(0)
    setIsOpen(false)
  }

  function moveHighlight(delta: number) {
    if (selectable.length === 0) return
    const next = isOpen ? (activeIndex + delta + selectable.length) % selectable.length : 0
    setIsOpen(true)
    setActiveIndex(next)
    document.getElementById(optionId(selectable[next]))?.scrollIntoView({ block: 'nearest' })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      // While an input method is composing, Enter confirms the characters, not the highlighted skill (229: Safari).
      if (event.nativeEvent.isComposing || event.keyCode === 229) return
      if (active) select(active)
      else setIsOpen(true)
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${baseId}-input`} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={`${baseId}-input`}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${baseId}-list`}
        aria-autocomplete="list"
        aria-activedescendant={active ? optionId(active) : undefined}
        autoComplete="off"
        maxLength={MAX_SKILL_NAME_LENGTH}
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onClick={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        className="mt-2 min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm"
      />
      <ul
        id={`${baseId}-list`}
        role="listbox"
        aria-label={label}
        hidden={!isOpen}
        className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg"
      >
        {matches.map((skill) => {
          const reason = blocked.get(skill.id)
          return (
            <li
              key={skill.id}
              id={optionId(skill)}
              role="option"
              aria-selected={skill === active}
              aria-disabled={Boolean(reason)}
              // Keeps focus in the input, otherwise blur would close the list before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => !reason && select(skill)}
              className={`flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${reason ? 'cursor-not-allowed text-muted' : 'cursor-pointer hover:bg-canvas'} ${skill === active ? 'bg-accent-soft text-accent-strong' : ''}`}
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{skill.name}</span>
              <span className="text-xs text-muted">{reason ?? skill.category}</span>
            </li>
          )
        })}
        {customSkill && (
          <li
            id={optionId(customSkill)}
            role="option"
            aria-selected={customSkill === active}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(customSkill)}
            className={`flex min-h-10 cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium [overflow-wrap:anywhere] hover:bg-canvas ${customSkill === active ? 'bg-accent-soft text-accent-strong' : ''}`}
          >
            Add custom skill: '{customSkill.name}'
          </li>
        )}
        {matches.length === 0 && !customSkill && (
          <li role="presentation" className="px-3 py-2 text-sm text-muted [overflow-wrap:anywhere]">
            {getEmptyMessage(searchName, isAlreadyAdded)}
          </li>
        )}
      </ul>
    </div>
  )
}
